// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// ---------------- AI IMPORTS ----------------
const OpenAI = require("openai"); // <-- Added

// --------------------------------------------
const app = express();

// Accept larger payloads (base64 images)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const JWT_SECRET = process.env.JWT_SECRET || "replace_with_your_secret";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event_manager";

// ----------- CONNECT MONGODB -----------
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------- Schemas ----------
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  date: String,
  time: String,
  location: String,
  attendees: { type: Number, default: 0 },
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});
const Event = mongoose.model("Event", EventSchema);

const MemberSchema = new Schema({
  name: { type: String, required: true },
  email: String,
  role: String,
  joinedAt: { type: Date, default: Date.now },
  avatar: String,
  meta: Schema.Types.Mixed,
});
const Member = mongoose.model("Member", MemberSchema);

// ---------- WebSocket Updates ----------
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

// ---------- Auth Middleware ----------
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
app.get("/", (req, res) => res.send("Backend up"));

app.post("/api/club-login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  if (!/\S+@\S+\.\S+/.test(email))
    return res.status(400).json({ error: "Invalid email format." });

  const clubPayload = { id: 1, name: "Demo Club", email, role: "club" };
  const token = jwt.sign(clubPayload, JWT_SECRET, { expiresIn: "2h" });
  return res.json({ token, club: clubPayload });
});

// ------- Updates API -------
app.post("/api/add-update", authenticateToken, (req, res) => {
  const { event, update } = req.body;
  if (!event || !update)
    return res.status(400).json({ error: "event and update required" });

  const newUpdate = { id: updates.length + 1, event, update };
  updates.push(newUpdate);
  broadcast(newUpdate);
  res.json({ success: true, update: newUpdate });
});

app.get("/api/updates", (req, res) => res.json(updates));

// ---------- Events API ----------
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

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
    });
    await ev.save();
    broadcast({ type: "event_created", event: ev });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: "Failed to create event" });
  }
});

app.put("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!ev) return res.status(404).json({ error: "Event not found" });

    broadcast({ type: "event_updated", event: ev });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.delete("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    broadcast({ type: "event_deleted", id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// ---------- Members API ----------
app.get("/api/members", async (req, res) => {
  try {
    const members = await Member.find().sort({ joinedAt: -1 }).lean();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.post("/api/members", authenticateToken, async (req, res) => {
  try {
    const m = new Member(req.body);
    await m.save();
    res.json(m);
  } catch (err) {
    res.status(500).json({ error: "Failed to create member" });
  }
});

// ---------------- AI CHATBOT API ----------------

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Route
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const aiReply = response.choices[0].message.content;
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "Sorry, AI service unavailable!" });
  }
});

// ---------------- WebSocket ----------------
wss.on("connection", (ws) => {
  console.log("New client connected");
  ws.send(JSON.stringify(updates));

  ws.on("close", () => console.log("Client disconnected"));
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
