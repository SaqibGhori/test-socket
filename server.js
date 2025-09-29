// Node.js + Socket.IO server for readings
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());

// Root test
app.get("/", (req, res) => {
  res.send("📡 Reading Server is live!");
});

// ✅ Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Normal messages
  socket.on("message", (msg) => {
    console.log("💬 Message:", msg);
    io.emit("message", msg); // broadcast back
  });

  // ✅ Readings via socket
  socket.on("reading", (data) => {
    const deviceId = data.deviceId || "unknown-device";
    console.log(`📡 Reading (Socket) from ${deviceId}:`, data);

    // broadcast readings to all clients
    io.emit("reading", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Readings via HTTP
app.post("/send-reading", (req, res) => {
  const deviceId = req.query.deviceId || req.body.deviceId || "unknown-device";
  const reading = req.body;

  console.log(`📡 Reading (HTTP) from ${deviceId}:`, reading);

  // broadcast to all clients too
  io.emit("reading", { deviceId, ...reading });

  res.status(200).send({ success: true, msg: "Reading received & broadcasted" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
