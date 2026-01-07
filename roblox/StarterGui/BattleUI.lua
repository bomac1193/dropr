--[[
    BattleUI.lua
    DROPR Battle User Interface

    Client-side UI handler for battles.
    Manages remix selection, voting, and results display.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

-- Wait for remotes
local RemoteEvents = ReplicatedStorage:WaitForChild("RemoteEvents")
local RemoteFunctions = ReplicatedStorage:WaitForChild("RemoteFunctions")

-- Events
local BattleStarted = RemoteEvents:WaitForChild("BattleStarted")
local RemixSelected = RemoteEvents:WaitForChild("RemixSelected")
local BattlePhaseChanged = RemoteEvents:WaitForChild("BattlePhaseChanged")
local VoteCast = RemoteEvents:WaitForChild("VoteCast")
local BattleEnded = RemoteEvents:WaitForChild("BattleEnded")
local QueueUpdated = RemoteEvents:WaitForChild("QueueUpdated")

-- Functions
local SelectRemix = RemoteFunctions:WaitForChild("SelectRemix")
local CastVoteFunc = RemoteFunctions:WaitForChild("CastVote")
local JoinQueue = RemoteFunctions:WaitForChild("JoinQueue")

local BattleUI = {}

-- State
local currentBattle = nil
local uiElements = {}

-- =============================================================================
-- UI Creation Helpers
-- =============================================================================

local function CreateElement(className, properties, parent)
    local element = Instance.new(className)
    for prop, value in pairs(properties) do
        element[prop] = value
    end
    element.Parent = parent
    return element
end

local function CreateGlassMorphicFrame(name, parent)
    local frame = CreateElement("Frame", {
        Name = name,
        BackgroundColor3 = Color3.fromRGB(20, 20, 35),
        BackgroundTransparency = 0.3,
        BorderSizePixel = 0,
        Size = UDim2.new(0, 200, 0, 150),
    }, parent)

    local corner = CreateElement("UICorner", { CornerRadius = UDim.new(0, 16) }, frame)
    local stroke = CreateElement("UIStroke", {
        Color = Color3.fromRGB(100, 100, 150),
        Thickness = 1,
        Transparency = 0.5,
    }, frame)

    return frame
end

-- =============================================================================
-- Create Main UI
-- =============================================================================

function BattleUI.CreateUI()
    -- Main ScreenGui
    local screenGui = CreateElement("ScreenGui", {
        Name = "DROPRBattleUI",
        ResetOnSpawn = false,
        IgnoreGuiInset = true,
    }, PlayerGui)

    -- Queue Button (Bottom Center)
    local queueButton = CreateElement("TextButton", {
        Name = "QueueButton",
        Position = UDim2.new(0.5, 0, 1, -100),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 200, 0, 60),
        BackgroundColor3 = Color3.fromRGB(123, 47, 247),
        Text = "FIND BATTLE",
        TextColor3 = Color3.new(1, 1, 1),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
    }, screenGui)
    CreateElement("UICorner", { CornerRadius = UDim.new(0, 30) }, queueButton)

    -- Battle Container (Hidden by default)
    local battleContainer = CreateElement("Frame", {
        Name = "BattleContainer",
        Position = UDim2.new(0.5, 0, 0.5, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Visible = false,
    }, screenGui)

    -- Phase Label
    local phaseLabel = CreateElement("TextLabel", {
        Name = "PhaseLabel",
        Position = UDim2.new(0.5, 0, 0.1, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 400, 0, 50),
        BackgroundTransparency = 1,
        Text = "SELECT YOUR REMIX",
        TextColor3 = Color3.new(1, 1, 1),
        TextSize = 32,
        Font = Enum.Font.GothamBold,
    }, battleContainer)

    -- Timer
    local timer = CreateElement("TextLabel", {
        Name = "Timer",
        Position = UDim2.new(0.5, 0, 0.15, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 100, 0, 40),
        BackgroundTransparency = 1,
        Text = "10",
        TextColor3 = Color3.fromRGB(0, 255, 255),
        TextSize = 36,
        Font = Enum.Font.GothamBold,
    }, battleContainer)

    -- Remix Selection Container
    local remixContainer = CreateElement("Frame", {
        Name = "RemixContainer",
        Position = UDim2.new(0.5, 0, 0.5, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 900, 0, 200),
        BackgroundTransparency = 1,
    }, battleContainer)

    local gridLayout = CreateElement("UIGridLayout", {
        CellSize = UDim2.new(0, 200, 0, 180),
        CellPadding = UDim2.new(0, 20, 0, 0),
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
    }, remixContainer)

    -- Voting Container (Hidden by default)
    local votingContainer = CreateElement("Frame", {
        Name = "VotingContainer",
        Position = UDim2.new(0.5, 0, 0.7, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 600, 0, 100),
        BackgroundTransparency = 1,
        Visible = false,
    }, battleContainer)

    -- Vote buttons
    local voteP1 = CreateElement("TextButton", {
        Name = "VoteP1",
        Position = UDim2.new(0.25, 0, 0.5, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 200, 0, 80),
        BackgroundColor3 = Color3.fromRGB(255, 100, 100),
        Text = "VOTE A",
        TextColor3 = Color3.new(1, 1, 1),
        TextSize = 24,
        Font = Enum.Font.GothamBold,
    }, votingContainer)
    CreateElement("UICorner", { CornerRadius = UDim.new(0, 12) }, voteP1)

    local voteP2 = CreateElement("TextButton", {
        Name = "VoteP2",
        Position = UDim2.new(0.75, 0, 0.5, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 200, 0, 80),
        BackgroundColor3 = Color3.fromRGB(100, 100, 255),
        Text = "VOTE B",
        TextColor3 = Color3.new(1, 1, 1),
        TextSize = 24,
        Font = Enum.Font.GothamBold,
    }, votingContainer)
    CreateElement("UICorner", { CornerRadius = UDim.new(0, 12) }, voteP2)

    -- Results Container (Hidden by default)
    local resultsContainer = CreateElement("Frame", {
        Name = "ResultsContainer",
        Position = UDim2.new(0.5, 0, 0.5, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(0, 500, 0, 300),
        BackgroundColor3 = Color3.fromRGB(20, 20, 35),
        BackgroundTransparency = 0.2,
        Visible = false,
    }, battleContainer)
    CreateElement("UICorner", { CornerRadius = UDim.new(0, 20) }, resultsContainer)

    local winnerLabel = CreateElement("TextLabel", {
        Name = "WinnerLabel",
        Position = UDim2.new(0.5, 0, 0.3, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(1, 0, 0, 60),
        BackgroundTransparency = 1,
        Text = "WINNER",
        TextColor3 = Color3.fromRGB(255, 215, 0),
        TextSize = 48,
        Font = Enum.Font.GothamBold,
    }, resultsContainer)

    local hypeEarned = CreateElement("TextLabel", {
        Name = "HypeEarned",
        Position = UDim2.new(0.5, 0, 0.6, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.new(1, 0, 0, 40),
        BackgroundTransparency = 1,
        Text = "+150 HYPE",
        TextColor3 = Color3.fromRGB(0, 255, 200),
        TextSize = 28,
        Font = Enum.Font.GothamBold,
    }, resultsContainer)

    -- Store references
    uiElements = {
        screenGui = screenGui,
        queueButton = queueButton,
        battleContainer = battleContainer,
        phaseLabel = phaseLabel,
        timer = timer,
        remixContainer = remixContainer,
        votingContainer = votingContainer,
        voteP1 = voteP1,
        voteP2 = voteP2,
        resultsContainer = resultsContainer,
        winnerLabel = winnerLabel,
        hypeEarned = hypeEarned,
    }

    -- Connect button events
    queueButton.MouseButton1Click:Connect(function()
        JoinQueue:InvokeServer()
        queueButton.Text = "SEARCHING..."
        queueButton.BackgroundColor3 = Color3.fromRGB(100, 100, 100)
    end)

    voteP1.MouseButton1Click:Connect(function()
        if currentBattle then
            CastVoteFunc:InvokeServer(currentBattle.battleId, "PLAYER_1")
            votingContainer.Visible = false
        end
    end)

    voteP2.MouseButton1Click:Connect(function()
        if currentBattle then
            CastVoteFunc:InvokeServer(currentBattle.battleId, "PLAYER_2")
            votingContainer.Visible = false
        end
    end)

    return uiElements
end

-- =============================================================================
-- Create Remix Cards
-- =============================================================================

function BattleUI.CreateRemixCards(remixes)
    -- Clear existing cards
    for _, child in ipairs(uiElements.remixContainer:GetChildren()) do
        if child:IsA("Frame") then
            child:Destroy()
        end
    end

    -- Genre colors
    local genreColors = {
        TRAP = Color3.fromRGB(255, 100, 100),
        HOUSE = Color3.fromRGB(100, 200, 255),
        DUBSTEP = Color3.fromRGB(150, 50, 255),
        PHONK = Color3.fromRGB(100, 255, 150),
        DRILL = Color3.fromRGB(255, 150, 50),
        HYPERPOP = Color3.fromRGB(255, 100, 200),
        JERSEY_CLUB = Color3.fromRGB(255, 200, 100),
        AMBIENT = Color3.fromRGB(100, 150, 200),
    }

    for _, remix in ipairs(remixes) do
        local card = CreateGlassMorphicFrame(remix.id, uiElements.remixContainer)
        card.Size = UDim2.new(0, 200, 0, 180)

        -- Genre label
        local genreLabel = CreateElement("TextLabel", {
            Name = "Genre",
            Position = UDim2.new(0.5, 0, 0.3, 0),
            AnchorPoint = Vector2.new(0.5, 0.5),
            Size = UDim2.new(0.9, 0, 0, 40),
            BackgroundTransparency = 1,
            Text = remix.genre,
            TextColor3 = genreColors[remix.genre] or Color3.new(1, 1, 1),
            TextSize = 24,
            Font = Enum.Font.GothamBold,
        }, card)

        -- Name label
        local nameLabel = CreateElement("TextLabel", {
            Name = "Name",
            Position = UDim2.new(0.5, 0, 0.55, 0),
            AnchorPoint = Vector2.new(0.5, 0.5),
            Size = UDim2.new(0.9, 0, 0, 30),
            BackgroundTransparency = 1,
            Text = remix.name or "Remix",
            TextColor3 = Color3.fromRGB(200, 200, 200),
            TextSize = 14,
            Font = Enum.Font.Gotham,
            TextTruncate = Enum.TextTruncate.AtEnd,
        }, card)

        -- Select button
        local selectBtn = CreateElement("TextButton", {
            Name = "SelectButton",
            Position = UDim2.new(0.5, 0, 0.8, 0),
            AnchorPoint = Vector2.new(0.5, 0.5),
            Size = UDim2.new(0.8, 0, 0, 35),
            BackgroundColor3 = genreColors[remix.genre] or Color3.fromRGB(123, 47, 247),
            Text = "SELECT",
            TextColor3 = Color3.new(1, 1, 1),
            TextSize = 16,
            Font = Enum.Font.GothamBold,
        }, card)
        CreateElement("UICorner", { CornerRadius = UDim.new(0, 8) }, selectBtn)

        -- Click handler
        selectBtn.MouseButton1Click:Connect(function()
            if currentBattle then
                local result = SelectRemix:InvokeServer(currentBattle.battleId, remix.id)
                if result.success then
                    -- Highlight selected card
                    for _, c in ipairs(uiElements.remixContainer:GetChildren()) do
                        if c:IsA("Frame") then
                            c.BackgroundTransparency = c.Name == remix.id and 0 or 0.5
                        end
                    end
                end
            end
        end)
    end
end

-- =============================================================================
-- Event Handlers
-- =============================================================================

BattleStarted.OnClientEvent:Connect(function(battleData)
    currentBattle = battleData

    -- Hide queue button, show battle UI
    uiElements.queueButton.Visible = false
    uiElements.battleContainer.Visible = true
    uiElements.remixContainer.Visible = true
    uiElements.votingContainer.Visible = false
    uiElements.resultsContainer.Visible = false

    -- Update phase
    uiElements.phaseLabel.Text = "SELECT YOUR REMIX"

    -- Create remix cards
    BattleUI.CreateRemixCards(battleData.remixes)

    -- Start timer
    local timeLeft = battleData.selectingTime
    spawn(function()
        while timeLeft > 0 and currentBattle do
            uiElements.timer.Text = tostring(timeLeft)
            wait(1)
            timeLeft = timeLeft - 1
        end
    end)
end)

BattlePhaseChanged.OnClientEvent:Connect(function(data)
    if data.phase == "PLAYING_P1" then
        uiElements.phaseLabel.Text = "NOW PLAYING: " .. data.player .. "'s REMIX"
        uiElements.remixContainer.Visible = false

    elseif data.phase == "PLAYING_P2" then
        uiElements.phaseLabel.Text = "NOW PLAYING: " .. data.player .. "'s REMIX"

    elseif data.phase == "VOTING" then
        uiElements.phaseLabel.Text = "VOTE NOW!"
        uiElements.votingContainer.Visible = true
        uiElements.voteP1.Text = "VOTE " .. data.player1
        uiElements.voteP2.Text = "VOTE " .. data.player2
    end

    -- Update timer
    if data.time then
        local timeLeft = data.time
        spawn(function()
            while timeLeft > 0 do
                uiElements.timer.Text = tostring(timeLeft)
                wait(1)
                timeLeft = timeLeft - 1
            end
        end)
    end
end)

VoteCast.OnClientEvent:Connect(function(data)
    -- Update vote counts display if visible
end)

BattleEnded.OnClientEvent:Connect(function(data)
    -- Show results
    uiElements.votingContainer.Visible = false
    uiElements.resultsContainer.Visible = true

    if data.winner then
        uiElements.winnerLabel.Text = data.winner.username .. " WINS!"
    else
        uiElements.winnerLabel.Text = "TIE!"
    end

    -- Determine hype earned for local player
    local hype = 0
    if currentBattle then
        -- Check if local player was in the battle
        hype = data.player1HypeEarned -- Simplified
    end
    uiElements.hypeEarned.Text = "+" .. tostring(hype) .. " HYPE"

    -- Reset after delay
    wait(5)
    uiElements.battleContainer.Visible = false
    uiElements.resultsContainer.Visible = false
    uiElements.queueButton.Visible = true
    uiElements.queueButton.Text = "FIND BATTLE"
    uiElements.queueButton.BackgroundColor3 = Color3.fromRGB(123, 47, 247)
    currentBattle = nil
end)

QueueUpdated.OnClientEvent:Connect(function(data)
    if data.inQueue then
        uiElements.queueButton.Text = "IN QUEUE (#" .. data.position .. ")"
    else
        uiElements.queueButton.Text = "FIND BATTLE"
        uiElements.queueButton.BackgroundColor3 = Color3.fromRGB(123, 47, 247)
    end
end)

-- =============================================================================
-- Initialize
-- =============================================================================

BattleUI.CreateUI()

return BattleUI
