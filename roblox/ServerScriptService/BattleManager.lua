--[[
    BattleManager.lua
    DROPR Battle System Manager

    Handles the battle lifecycle:
    1. Matchmaking
    2. Remix Selection (10 seconds)
    3. Playback P1 (15 seconds)
    4. Playback P2 (15 seconds)
    5. Voting (15 seconds)
    6. Results
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local TasteGraphAPI = require(script.Parent.TasteGraphAPI)

-- Remote Events (create these in ReplicatedStorage)
local RemoteEvents = ReplicatedStorage:WaitForChild("RemoteEvents")
local BattleStarted = RemoteEvents:WaitForChild("BattleStarted")
local RemixSelected = RemoteEvents:WaitForChild("RemixSelected")
local BattlePhaseChanged = RemoteEvents:WaitForChild("BattlePhaseChanged")
local VoteCast = RemoteEvents:WaitForChild("VoteCast")
local BattleEnded = RemoteEvents:WaitForChild("BattleEnded")
local QueueUpdated = RemoteEvents:WaitForChild("QueueUpdated")

-- Remote Functions
local RemoteFunctions = ReplicatedStorage:WaitForChild("RemoteFunctions")
local SelectRemixFunction = RemoteFunctions:WaitForChild("SelectRemix")
local CastVoteFunction = RemoteFunctions:WaitForChild("CastVote")

local BattleManager = {}
BattleManager.__index = BattleManager

-- Configuration
local SELECTING_TIME = 10
local PLAYBACK_TIME = 15
local VOTING_TIME = 15

-- State
local activeBattles = {} -- battleId -> battleData
local playerData = {} -- playerId -> {apiPlayerId, inBattle, inQueue}

-- =============================================================================
-- Player Management
-- =============================================================================

function BattleManager.OnPlayerJoin(player)
    -- Register player with API
    local response = TasteGraphAPI:PlayerJoin(player)

    if response and response.success then
        playerData[player.UserId] = {
            apiPlayerId = response.data.playerId,
            username = response.data.username,
            hypePoints = response.data.hypePoints,
            archetype = response.data.archetype,
            inBattle = false,
            inQueue = false
        }
        print("[BattleManager] Player registered:", player.Name, "->", response.data.playerId)
    else
        warn("[BattleManager] Failed to register player:", player.Name)
    end
end

function BattleManager.OnPlayerLeave(player)
    -- Clean up player data
    local data = playerData[player.UserId]
    if data then
        -- Remove from queue if in queue
        if data.inQueue then
            -- API will handle queue expiry
        end
        playerData[player.UserId] = nil
    end
end

function BattleManager.GetPlayerData(player)
    return playerData[player.UserId]
end

-- =============================================================================
-- Queue Management
-- =============================================================================

function BattleManager.JoinQueue(player)
    local data = playerData[player.UserId]
    if not data then
        warn("[BattleManager] Player not registered:", player.Name)
        return false
    end

    if data.inBattle then
        warn("[BattleManager] Player already in battle:", player.Name)
        return false
    end

    if data.inQueue then
        warn("[BattleManager] Player already in queue:", player.Name)
        return false
    end

    -- Join API queue
    local response = TasteGraphAPI:JoinQueue(data.apiPlayerId, "balanced")

    if response and response.success then
        if response.action == "match_found" then
            -- Immediate match found!
            BattleManager.StartBattle(response.data)
            return true
        else
            -- Added to queue
            data.inQueue = true
            QueueUpdated:FireClient(player, {
                inQueue = true,
                position = response.data.position
            })
            return true
        end
    end

    return false
end

function BattleManager.CheckForMatch(player)
    local data = playerData[player.UserId]
    if not data or not data.inQueue then
        return nil
    end

    local response = TasteGraphAPI:CheckQueue(data.apiPlayerId)

    if response and response.success and response.action == "match_found" then
        data.inQueue = false
        return response.data
    end

    return nil
end

-- =============================================================================
-- Battle Lifecycle
-- =============================================================================

function BattleManager.StartBattle(matchData)
    local battleId = matchData.battleId

    -- Find the Roblox players
    local player1 = nil
    local player2 = nil

    for _, player in ipairs(Players:GetPlayers()) do
        local data = playerData[player.UserId]
        if data then
            if data.apiPlayerId == matchData.player1.id then
                player1 = player
            elseif data.apiPlayerId == matchData.player2.id then
                player2 = player
            end
        end
    end

    if not player1 or not player2 then
        warn("[BattleManager] Could not find both players for battle")
        return
    end

    -- Update player states
    playerData[player1.UserId].inQueue = false
    playerData[player1.UserId].inBattle = true
    playerData[player2.UserId].inQueue = false
    playerData[player2.UserId].inBattle = true

    -- Create battle state
    activeBattles[battleId] = {
        id = battleId,
        player1 = player1,
        player2 = player2,
        sound = matchData.sound,
        remixes = matchData.remixes,
        phase = "SELECTING",
        player1Selection = nil,
        player2Selection = nil,
        votes = {},
        startTime = tick()
    }

    -- Notify both players
    local battleInfo = {
        battleId = battleId,
        opponent = nil, -- Set per player
        sound = matchData.sound,
        remixes = matchData.remixes,
        selectingTime = SELECTING_TIME
    }

    battleInfo.opponent = {
        username = player2.Name,
        displayName = player2.DisplayName
    }
    BattleStarted:FireClient(player1, battleInfo)

    battleInfo.opponent = {
        username = player1.Name,
        displayName = player1.DisplayName
    }
    BattleStarted:FireClient(player2, battleInfo)

    -- Start the battle timer
    BattleManager.RunBattlePhases(battleId)
end

function BattleManager.RunBattlePhases(battleId)
    local battle = activeBattles[battleId]
    if not battle then return end

    -- Phase 1: Selecting (10 seconds)
    battle.phase = "SELECTING"
    BattlePhaseChanged:FireClient(battle.player1, { phase = "SELECTING", time = SELECTING_TIME })
    BattlePhaseChanged:FireClient(battle.player2, { phase = "SELECTING", time = SELECTING_TIME })

    wait(SELECTING_TIME)

    -- If players didn't select, auto-select random
    if not battle.player1Selection then
        battle.player1Selection = battle.remixes[1]
    end
    if not battle.player2Selection then
        battle.player2Selection = battle.remixes[2]
    end

    -- Phase 2: Playing Player 1's remix (15 seconds)
    battle.phase = "PLAYING_P1"
    local p1Data = {
        phase = "PLAYING_P1",
        time = PLAYBACK_TIME,
        remix = battle.player1Selection,
        player = battle.player1.Name
    }
    BattlePhaseChanged:FireAllClients(p1Data)

    -- Advance battle state on API
    TasteGraphAPI:AdvanceBattle(battleId)

    wait(PLAYBACK_TIME)

    -- Phase 3: Playing Player 2's remix (15 seconds)
    battle.phase = "PLAYING_P2"
    local p2Data = {
        phase = "PLAYING_P2",
        time = PLAYBACK_TIME,
        remix = battle.player2Selection,
        player = battle.player2.Name
    }
    BattlePhaseChanged:FireAllClients(p2Data)

    TasteGraphAPI:AdvanceBattle(battleId)

    wait(PLAYBACK_TIME)

    -- Phase 4: Voting (15 seconds)
    battle.phase = "VOTING"
    BattlePhaseChanged:FireAllClients({
        phase = "VOTING",
        time = VOTING_TIME,
        player1 = battle.player1.Name,
        player2 = battle.player2.Name
    })

    wait(VOTING_TIME)

    -- Phase 5: Complete battle
    BattleManager.CompleteBattle(battleId)
end

-- =============================================================================
-- Battle Actions
-- =============================================================================

function BattleManager.SelectRemix(player, battleId, remixId)
    local battle = activeBattles[battleId]
    if not battle then
        return { success = false, error = "Battle not found" }
    end

    if battle.phase ~= "SELECTING" then
        return { success = false, error = "Not in selection phase" }
    end

    local data = playerData[player.UserId]
    if not data then
        return { success = false, error = "Player not registered" }
    end

    -- Find the selected remix
    local selectedRemix = nil
    for _, remix in ipairs(battle.remixes) do
        if remix.id == remixId then
            selectedRemix = remix
            break
        end
    end

    if not selectedRemix then
        return { success = false, error = "Invalid remix" }
    end

    -- Record selection
    if player == battle.player1 then
        battle.player1Selection = selectedRemix
    elseif player == battle.player2 then
        battle.player2Selection = selectedRemix
    else
        return { success = false, error = "Player not in this battle" }
    end

    -- Notify API
    TasteGraphAPI:SelectRemix(battleId, data.apiPlayerId, remixId)

    -- Notify the other player that opponent has selected
    local opponent = player == battle.player1 and battle.player2 or battle.player1
    RemixSelected:FireClient(opponent, {
        battleId = battleId,
        opponentSelected = true,
        genre = selectedRemix.genre
    })

    return { success = true, remix = selectedRemix }
end

function BattleManager.CastVote(player, battleId, votedFor)
    local battle = activeBattles[battleId]
    if not battle then
        return { success = false, error = "Battle not found" }
    end

    if battle.phase ~= "VOTING" then
        return { success = false, error = "Not in voting phase" }
    end

    local data = playerData[player.UserId]
    if not data then
        return { success = false, error = "Player not registered" }
    end

    -- Players can't vote in their own battle
    if player == battle.player1 or player == battle.player2 then
        return { success = false, error = "Cannot vote in your own battle" }
    end

    -- Check if already voted
    if battle.votes[player.UserId] then
        return { success = false, error = "Already voted" }
    end

    -- Record vote
    battle.votes[player.UserId] = votedFor

    -- Send to API
    TasteGraphAPI:CastVote(battleId, data.apiPlayerId, votedFor)

    -- Notify all players of vote count update
    local p1Votes = 0
    local p2Votes = 0
    for _, vote in pairs(battle.votes) do
        if vote == "PLAYER_1" then
            p1Votes = p1Votes + 1
        else
            p2Votes = p2Votes + 1
        end
    end

    VoteCast:FireAllClients({
        battleId = battleId,
        player1Votes = p1Votes,
        player2Votes = p2Votes
    })

    return { success = true }
end

function BattleManager.CompleteBattle(battleId)
    local battle = activeBattles[battleId]
    if not battle then return end

    -- Get results from API
    local response = TasteGraphAPI:CompleteBattle(battleId)

    if response and response.success then
        local results = response.data

        -- Notify all players of results
        BattleEnded:FireAllClients({
            battleId = battleId,
            winner = results.winner,
            player1Votes = results.player1Votes,
            player2Votes = results.player2Votes,
            crowdEnergy = results.crowdEnergy,
            player1HypeEarned = results.player1HypeEarned,
            player2HypeEarned = results.player2HypeEarned
        })

        -- Update player states
        if playerData[battle.player1.UserId] then
            playerData[battle.player1.UserId].inBattle = false
            playerData[battle.player1.UserId].hypePoints =
                (playerData[battle.player1.UserId].hypePoints or 0) + results.player1HypeEarned
        end

        if playerData[battle.player2.UserId] then
            playerData[battle.player2.UserId].inBattle = false
            playerData[battle.player2.UserId].hypePoints =
                (playerData[battle.player2.UserId].hypePoints or 0) + results.player2HypeEarned
        end
    end

    -- Clean up battle
    activeBattles[battleId] = nil
end

-- =============================================================================
-- Initialize
-- =============================================================================

function BattleManager.Initialize()
    -- Connect player events
    Players.PlayerAdded:Connect(BattleManager.OnPlayerJoin)
    Players.PlayerRemoving:Connect(BattleManager.OnPlayerLeave)

    -- Register existing players
    for _, player in ipairs(Players:GetPlayers()) do
        BattleManager.OnPlayerJoin(player)
    end

    -- Connect remote functions
    SelectRemixFunction.OnServerInvoke = function(player, battleId, remixId)
        return BattleManager.SelectRemix(player, battleId, remixId)
    end

    CastVoteFunction.OnServerInvoke = function(player, battleId, votedFor)
        return BattleManager.CastVote(player, battleId, votedFor)
    end

    print("[BattleManager] Initialized")
end

return BattleManager
