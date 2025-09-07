const PORT = process.env.PORT || 3000;
const io = require("socket.io")(PORT, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket"]
});

console.log(`📡 Quiz server running on port ${PORT}...`);

io.on("connection", (socket) => {
    console.log("🔗 New client connected: " + socket.id);

    socket.on("newQuestion", (question) => {
        socket.broadcast.emit("newQuestion", question);
    });

    socket.on("newAnswer", (answer) => {
        io.emit("newAnswer", answer);
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected: " + socket.id);
    });
});
