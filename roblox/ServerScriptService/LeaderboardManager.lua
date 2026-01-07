--[[
    LeaderboardManager.lua
    DROPR Leaderboard System

    Manages leaderboard data and updates.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TasteGraphAPI = require(script.Parent.TasteGraphAPI)

local LeaderboardManager = {}

-- Cache
local leaderboardCache = {
    hype = nil,
    influence = nil,
    wins = nil,
    lastUpdate = 0
}

local CACHE_DURATION = 30 -- seconds

-- =============================================================================
-- Get Leaderboard
-- =============================================================================

function LeaderboardManager.GetLeaderboard(leaderboardType)
    local now = tick()

    -- Check cache
    if leaderboardCache[leaderboardType] and (now - leaderboardCache.lastUpdate) < CACHE_DURATION then
        return leaderboardCache[leaderboardType]
    end

    -- Fetch from API
    local response = TasteGraphAPI:GetLeaderboard(leaderboardType, 10)

    if response and response.success then
        leaderboardCache[leaderboardType] = response.data
        leaderboardCache.lastUpdate = now
        return response.data
    end

    return leaderboardCache[leaderboardType] or {}
end

-- =============================================================================
-- Update Leaderboards (Background)
-- =============================================================================

function LeaderboardManager.UpdateAllLeaderboards()
    local types = { "hype", "influence", "wins" }

    for _, leaderboardType in ipairs(types) do
        local response = TasteGraphAPI:GetLeaderboard(leaderboardType, 10)
        if response and response.success then
            leaderboardCache[leaderboardType] = response.data
        end
    end

    leaderboardCache.lastUpdate = tick()

    -- Notify all clients
    local RemoteEvents = ReplicatedStorage:WaitForChild("RemoteEvents")
    local LeaderboardUpdated = RemoteEvents:WaitForChild("LeaderboardUpdated")

    LeaderboardUpdated:FireAllClients({
        hype = leaderboardCache.hype,
        influence = leaderboardCache.influence,
        wins = leaderboardCache.wins
    })
end

-- =============================================================================
-- Initialize
-- =============================================================================

function LeaderboardManager.Initialize()
    -- Initial fetch
    LeaderboardManager.UpdateAllLeaderboards()

    -- Update every 30 seconds
    spawn(function()
        while true do
            wait(30)
            LeaderboardManager.UpdateAllLeaderboards()
        end
    end)

    print("[LeaderboardManager] Initialized")
end

return LeaderboardManager
