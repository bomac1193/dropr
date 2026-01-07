--[[
    MainServer.lua
    DROPR Main Server Script

    Entry point for the DROPR Roblox game server.
    Initializes all server-side systems.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

-- =============================================================================
-- Create Remote Events and Functions
-- =============================================================================

local function CreateRemotes()
    -- Create folders
    local remoteEvents = Instance.new("Folder")
    remoteEvents.Name = "RemoteEvents"
    remoteEvents.Parent = ReplicatedStorage

    local remoteFunctions = Instance.new("Folder")
    remoteFunctions.Name = "RemoteFunctions"
    remoteFunctions.Parent = ReplicatedStorage

    -- Battle Events
    local events = {
        "BattleStarted",
        "RemixSelected",
        "BattlePhaseChanged",
        "VoteCast",
        "BattleEnded",
        "QueueUpdated",
        "LeaderboardUpdated",
        "PlayerStatsUpdated"
    }

    for _, eventName in ipairs(events) do
        local event = Instance.new("RemoteEvent")
        event.Name = eventName
        event.Parent = remoteEvents
    end

    -- Remote Functions
    local functions = {
        "SelectRemix",
        "CastVote",
        "JoinQueue",
        "LeaveQueue",
        "GetLeaderboard",
        "GetPlayerStats"
    }

    for _, funcName in ipairs(functions) do
        local func = Instance.new("RemoteFunction")
        func.Name = funcName
        func.Parent = remoteFunctions
    end

    print("[MainServer] Remote events and functions created")
end

-- =============================================================================
-- Initialize Modules
-- =============================================================================

local function Initialize()
    -- Create remotes first
    CreateRemotes()

    -- Wait a frame for remotes to replicate
    wait()

    -- Initialize Battle Manager
    local BattleManager = require(script.Parent.BattleManager)
    BattleManager.Initialize()

    -- Initialize Leaderboard Manager
    local LeaderboardManager = require(script.Parent.LeaderboardManager)
    LeaderboardManager.Initialize()

    -- Set up additional remote function handlers
    local RemoteFunctions = ReplicatedStorage:WaitForChild("RemoteFunctions")

    RemoteFunctions.JoinQueue.OnServerInvoke = function(player)
        return BattleManager.JoinQueue(player)
    end

    RemoteFunctions.LeaveQueue.OnServerInvoke = function(player)
        local data = BattleManager.GetPlayerData(player)
        if data then
            data.inQueue = false
        end
        return { success = true }
    end

    RemoteFunctions.GetLeaderboard.OnServerInvoke = function(player, leaderboardType)
        return LeaderboardManager.GetLeaderboard(leaderboardType)
    end

    RemoteFunctions.GetPlayerStats.OnServerInvoke = function(player)
        return BattleManager.GetPlayerData(player)
    end

    print("[MainServer] DROPR Server initialized!")
end

-- =============================================================================
-- Start
-- =============================================================================

Initialize()
