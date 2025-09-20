// backend/server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const JWT_SECRET = "replace_with_your_secret";

let updates = [
  { id: 1, event: "Seminar", update: "Starts at 5 PM" },
  { id: 2, event: "Photography Club", update: "New event announced" },
];

// Broadcast function
function broadcast(update) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
}

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.club = decoded; // store decoded club info
    next();
  });
}

// Protected add-update route
app.post("/api/add-update", authenticateToken, (req, res) => {
  const { event, update } = req.body;
  if (!event || !update) return res.status(400).json({ error: "event and update required" });

  const newUpdate = { id: updates.length + 1, event, update };
  updates.push(newUpdate);

  broadcast(newUpdate);
  res.json({ success: true, update: newUpdate });
});

// Public route to fetch all updates
app.get("/api/updates", (req, res) => {
  res.json(updates);
});

// WebSocket connection
wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.send(JSON.stringify(updates));
  ws.on("close", () => console.log("Client disconnected"));
});

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
