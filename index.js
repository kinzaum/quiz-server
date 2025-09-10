const PORT = process.env.PORT || 3000;
const fs = require("fs");
const path = require("path");
const io = require("socket.io")(PORT, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket"]
});

console.log(`📡 Quiz server running on port ${PORT}...`);

// Path for optional JSON persistence
const DATA_FILE = path.join(__dirname, "scores.json");

// In-memory leaderboard
let leaderboard = [];

// Load existing scores if file exists
if (fs.existsSync(DATA_FILE)) {
    try {
        leaderboard = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch (err) {
        console.error("Error reading scores.json:", err);
    }
}

io.on("connection", (socket) => {
    console.log("🔗 New client connected: " + socket.id);

    // Send current leaderboard to new client
    socket.emit("leaderboardUpdate", leaderboard);

    // Handle score submission
    socket.on("submitScore", (data) => {
        const { playerName, score } = data;
        if (typeof playerName === "string" && typeof score === "number") {
            leaderboard.push({ playerName, score, timestamp: Date.now() });

            // Sort leaderboard descending by score
            leaderboard.sort((a, b) => b.score - a.score);

            // Keep top 20 scores
            leaderboard = leaderboard.slice(0, 20);

            // Save to JSON file
            fs.writeFile(DATA_FILE, JSON.stringify(leaderboard, null, 2), (err) => {
                if (err) console.error("Error saving leaderboard:", err);
            });

            // Broadcast updated leaderboard
            io.emit("leaderboardUpdate", leaderboard);
            console.log(`🏆 Score submitted: ${playerName} -> ${score}`);
        } else {
            console.warn("Invalid score submission:", data);
        }
    });

    // Client requests current leaderboard
    socket.on("getLeaderboard", () => {
        socket.emit("leaderboardUpdate", leaderboard);
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected: " + socket.id);
    });
});
