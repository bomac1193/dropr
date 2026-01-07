--[[
    TasteGraphAPI.lua
    DROPR API Client for Roblox

    Handles all HTTP communication with the DROPR Taste Graph API.
    Uses HttpService for REST calls to the backend.
]]

local HttpService = game:GetService("HttpService")

local TasteGraphAPI = {}
TasteGraphAPI.__index = TasteGraphAPI

-- Configuration
local API_BASE_URL = "https://your-api.dropr.io/api/webhook/roblox" -- UPDATE THIS
local WEBHOOK_SECRET = "" -- Set via environment or game settings

-- =============================================================================
-- Constructor
-- =============================================================================

function TasteGraphAPI.new()
    local self = setmetatable({}, TasteGraphAPI)
    self.baseUrl = API_BASE_URL
    return self
end

-- =============================================================================
-- HTTP Helper
-- =============================================================================

function TasteGraphAPI:_request(action, data)
    local url = self.baseUrl

    local body = HttpService:JSONEncode({
        action = action,
        data = data or {}
    })

    local success, result = pcall(function()
        return HttpService:PostAsync(
            url,
            body,
            Enum.HttpContentType.ApplicationJson,
            false,
            {
                ["x-roblox-secret"] = WEBHOOK_SECRET,
                ["Content-Type"] = "application/json"
            }
        )
    end)

    if not success then
        warn("[TasteGraphAPI] Request failed:", result)
        return nil, result
    end

    local decoded = HttpService:JSONDecode(result)
    return decoded
end

-- =============================================================================
-- Player Actions
-- =============================================================================

--- Register or update a player when they join
function TasteGraphAPI:PlayerJoin(player)
    local data = {
        robloxUserId = player.UserId,
        username = player.Name,
        displayName = player.DisplayName,
        avatarUrl = string.format(
            "https://www.roblox.com/headshot-thumbnail/image?userId=%d&width=420&height=420&format=png",
            player.UserId
        )
    }

    return self:_request("player_join", data)
end

--- Get player statistics
function TasteGraphAPI:GetPlayerStats(playerId, robloxUserId)
    return self:_request("get_player_stats", {
        playerId = playerId,
        robloxUserId = robloxUserId
    })
end

-- =============================================================================
-- Matchmaking Actions
-- =============================================================================

--- Join the matchmaking queue
function TasteGraphAPI:JoinQueue(playerId, mode)
    return self:_request("join_queue", {
        playerId = playerId,
        mode = mode or "balanced"
    })
end

--- Check if a match has been found
function TasteGraphAPI:CheckQueue(playerId)
    return self:_request("check_queue", {
        playerId = playerId
    })
end

-- =============================================================================
-- Battle Actions
-- =============================================================================

--- Select a remix during battle
function TasteGraphAPI:SelectRemix(battleId, playerId, remixId)
    return self:_request("select_remix", {
        battleId = battleId,
        playerId = playerId,
        remixId = remixId
    })
end

--- Advance battle to next state
function TasteGraphAPI:AdvanceBattle(battleId)
    return self:_request("advance_battle", {
        battleId = battleId
    })
end

--- Cast a vote in a battle
function TasteGraphAPI:CastVote(battleId, voterId, votedFor)
    return self:_request("cast_vote", {
        battleId = battleId,
        voterId = voterId,
        votedFor = votedFor -- "PLAYER_1" or "PLAYER_2"
    })
end

--- Complete a battle and get results
function TasteGraphAPI:CompleteBattle(battleId)
    return self:_request("complete_battle", {
        battleId = battleId
    })
end

-- =============================================================================
-- Data Actions
-- =============================================================================

--- Get available sounds
function TasteGraphAPI:GetSounds(category, limit)
    return self:_request("get_sounds", {
        category = category,
        limit = limit or 10
    })
end

--- Get leaderboard
function TasteGraphAPI:GetLeaderboard(leaderboardType, limit)
    return self:_request("get_leaderboard", {
        type = leaderboardType or "hype",
        limit = limit or 10
    })
end

-- =============================================================================
-- Module Export
-- =============================================================================

return TasteGraphAPI.new()
