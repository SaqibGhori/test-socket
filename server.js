// Node.js + Express + Socket.IO hybrid server
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ Support JSON + URL-encoded forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root test
app.get("/", (req, res) => {
  res.send("📡 Hybrid Reading Server is live!");
});

// ✅ Socket.IO connections
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Optional device register event
  socket.on("register", (data) => {
    console.log(`📡 Device registered: ${data.deviceId} (socket: ${socket.id})`);
    socket.deviceId = data.deviceId;
  });

  // Normal chat-style messages
  socket.on("message", (msg) => {
    console.log("💬 Message:", msg);
    io.emit("message", msg);
  });

  // Readings via Socket.IO
  socket.on("reading", (data) => {
    const deviceId = data.deviceId || socket.deviceId || "unknown-device";
    console.log(`📡 Reading (Socket) from ${deviceId}:`, data);

    // broadcast to all clients
    io.emit("reading", data);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.deviceId || socket.id}`);
  });
});

// ✅ HTTP POST endpoint
app.post("/send-reading", (req, res) => {
  const deviceId = req.query.deviceId || req.body.deviceId || "unknown-device";
  const reading = req.body;

  console.log(`📡 Reading (HTTP) from ${deviceId}:`, reading);

  // broadcast to connected socket clients as well
  io.emit("reading", { deviceId, ...reading });

  res.status(200).send({ success: true, msg: "Reading received & broadcasted" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Hybrid Server running at http://localhost:${PORT}`);
});
