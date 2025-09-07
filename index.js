const PORT = process.env.PORT || 3000;
const io = require("socket.io")(PORT, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ["websocket"]
});

console.log(`📡 Quiz server running on port ${PORT}...`);

io.on("connection", (socket) => {
    console.log("🔗 New client connected: " + socket.id);

    // Listen for a "buttonPressed" event from a client
    socket.on("buttonPressed", () => {
        // Broadcast a "buttonPressed" message to all other connected clients
        // This is the message that will trigger the text update on the other device.
        socket.broadcast.emit("buttonPressed");
        console.log(`➡️ Button press event broadcasted from client: ${socket.id}`);
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected: " + socket.id);
    });
});
