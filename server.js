// Raw WebSocket + HTTP server
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ✅ Root test
app.get("/", (req, res) => {
  res.send("📡 Raw WebSocket + HTTP server is live!");
});

// ✅ WebSocket connections
wss.on("connection", (ws, req) => {
  const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log("✅ WebSocket client connected:", clientIP);

  ws.on("message", (message) => {
    console.log("📡 Reading (WebSocket):", message.toString());

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected:", clientIP);
  });
});

// ✅ HTTP endpoint (optional – agar koi device POST bhejna chahe)
app.use(express.json());
app.post("/send-reading", (req, res) => {
  const reading = req.body;
  console.log("📡 Reading (HTTP):", reading);

  // Broadcast to WebSocket clients too
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(reading));
    }
  });

  res.status(200).send({ success: true, msg: "Reading received" });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Raw WebSocket server running on port ${PORT}`);
});
