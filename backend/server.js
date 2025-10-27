// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();

// Accept larger payloads (base64 images)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const JWT_SECRET = process.env.JWT_SECRET || "replace_with_your_secret";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event_manager";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------- Schemas & Models ----------
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  date: String,
  time: String,
  location: String,
  attendees: { type: Number, default: 0 },
  description: String,
  image: String, // base64 dataURL or image URL
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});
const Event = mongoose.model("Event", EventSchema);

const MemberSchema = new Schema({
  name: { type: String, required: true },
  email: String,
  role: String,
  joinedAt: { type: Date, default: Date.now },
  avatar: String, // base64 or url
  meta: Schema.Types.Mixed,
});
const Member = mongoose.model("Member", MemberSchema);

// Keep your updates buffer & broadcast
let updates = [
  { id: 1, event: "Seminar", update: "Starts at 5 PM" },
  { id: 2, event: "Photography Club", update: "New event announced" },
];

function broadcast(update) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
}

// ---------- Auth middleware ----------
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Malformed Authorization header" });

  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.club = decoded;
    next();
  });
}

// ---------- Routes ----------

// Basic health
app.get("/", (req, res) => res.send("Backend up"));

// Club login (demo) - returns JWT + club info
app.post("/api/club-login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: "Invalid email format." });

  const clubPayload = { id: 1, name: "Demo Club", email, role: "club" };
  const token = jwt.sign(clubPayload, JWT_SECRET, { expiresIn: "2h" });
  return res.json({ token, club: clubPayload });
});

// Updates endpoints (existing)
app.post("/api/add-update", authenticateToken, (req, res) => {
  const { event, update } = req.body;
  if (!event || !update) return res.status(400).json({ error: "event and update required" });
  const newUpdate = { id: updates.length + 1, event, update };
  updates.push(newUpdate);
  broadcast(newUpdate);
  res.json({ success: true, update: newUpdate });
});
app.get("/api/updates", (req, res) => res.json(updates));

// ---------- Events API ----------

// GET /api/events  -> list all events (public)
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    res.json(events);
  } catch (err) {
    console.error("GET /api/events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// POST /api/events -> create event (protected)
app.post("/api/events", authenticateToken, async (req, res) => {
  try {
    const ev = new Event({
      title: req.body.title,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      attendees: req.body.attendees || 0,
      description: req.body.description || "",
      image: req.body.image || "",
      createdAt: new Date(),
    });
    await ev.save();
    // also broadcast
    broadcast({ type: "event_created", event: ev });
    res.json(ev);
  } catch (err) {
    console.error("POST /api/events error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// PUT /api/events/:id -> update event (protected)
app.put("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const update = {
      title: req.body.title,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      attendees: req.body.attendees,
      description: req.body.description,
      image: req.body.image,
      updatedAt: new Date(),
    };
    const ev = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ev) return res.status(404).json({ error: "Event not found" });
    broadcast({ type: "event_updated", event: ev });
    res.json(ev);
  } catch (err) {
    console.error("PUT /api/events/:id error:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE /api/events/:id -> delete (protected)
app.delete("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).json({ error: "Event not found" });
    broadcast({ type: "event_deleted", id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/events/:id error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// ---------- Members API ----------

// GET /api/members -> list members (public)
app.get("/api/members", async (req, res) => {
  try {
    const members = await Member.find().sort({ joinedAt: -1 }).lean();
    res.json(members);
  } catch (err) {
    console.error("GET /api/members error:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// GET /api/members/:id -> single member (public)
app.get("/api/members/:id", async (req, res) => {
  try {
    const mem = await Member.findById(req.params.id).lean();
    if (!mem) return res.status(404).json({ error: "Member not found" });
    res.json(mem);
  } catch (err) {
    console.error("GET /api/members/:id error:", err);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});

// POST /api/members -> create (protected)
app.post("/api/members", authenticateToken, async (req, res) => {
  try {
    const m = new Member({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      avatar: req.body.avatar || "",
      meta: req.body.meta || {},
    });
    await m.save();
    res.json(m);
  } catch (err) {
    console.error("POST /api/members error:", err);
    res.status(500).json({ error: "Failed to create member" });
  }
});

// PUT /api/members/:id -> update (protected)
app.put("/api/members/:id", authenticateToken, async (req, res) => {
  try {
    const m = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) return res.status(404).json({ error: "Member not found" });
    res.json(m);
  } catch (err) {
    console.error("PUT /api/members/:id error:", err);
    res.status(500).json({ error: "Failed to update member" });
  }
});

// DELETE /api/members/:id -> delete (protected)
app.delete("/api/members/:id", authenticateToken, async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/members/:id error:", err);
    res.status(500).json({ error: "Failed to delete member" });
  }
});

// ---------- WebSocket ----------
wss.on("connection", (ws) => {
  console.log("New client connected");
  // send current updates buffer on connect
  ws.send(JSON.stringify(updates));
  ws.on("close", () => console.log("Client disconnected"));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));