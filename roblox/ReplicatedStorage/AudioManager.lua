--[[
    AudioManager.lua
    DROPR Audio Playback Manager

    Handles audio playback for battles.
    Loads audio from URLs and manages playback state.
]]

local SoundService = game:GetService("SoundService")
local ContentProvider = game:GetService("ContentProvider")

local AudioManager = {}
AudioManager.__index = AudioManager

-- Sound instances
local currentSound = nil
local soundFolder = nil

-- =============================================================================
-- Initialize
-- =============================================================================

function AudioManager.Initialize()
    -- Create sound folder
    soundFolder = Instance.new("Folder")
    soundFolder.Name = "DROPRAudio"
    soundFolder.Parent = SoundService

    print("[AudioManager] Initialized")
end

-- =============================================================================
-- Load Audio
-- =============================================================================

function AudioManager.LoadAudio(audioUrl, audioId)
    -- Create sound instance
    local sound = Instance.new("Sound")
    sound.Name = audioId or "BattleSound"
    sound.SoundId = audioUrl
    sound.Volume = 1
    sound.Parent = soundFolder

    -- Preload
    ContentProvider:PreloadAsync({ sound })

    return sound
end

-- =============================================================================
-- Play Audio
-- =============================================================================

function AudioManager.Play(sound)
    -- Stop current if playing
    if currentSound then
        currentSound:Stop()
    end

    currentSound = sound
    sound:Play()
end

function AudioManager.PlayFromUrl(audioUrl)
    local sound = AudioManager.LoadAudio(audioUrl)
    AudioManager.Play(sound)
    return sound
end

-- =============================================================================
-- Stop Audio
-- =============================================================================

function AudioManager.Stop()
    if currentSound then
        currentSound:Stop()
        currentSound = nil
    end
end

-- =============================================================================
-- Volume Control
-- =============================================================================

function AudioManager.SetVolume(volume)
    if currentSound then
        currentSound.Volume = math.clamp(volume, 0, 1)
    end
end

-- =============================================================================
-- Get Playback Position
-- =============================================================================

function AudioManager.GetPosition()
    if currentSound then
        return currentSound.TimePosition
    end
    return 0
end

function AudioManager.GetDuration()
    if currentSound then
        return currentSound.TimeLength
    end
    return 0
end

-- =============================================================================
-- Clean Up
-- =============================================================================

function AudioManager.Cleanup()
    AudioManager.Stop()

    for _, child in ipairs(soundFolder:GetChildren()) do
        child:Destroy()
    end
end

return AudioManager
