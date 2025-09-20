// backend/club-server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "replace_with_a_secure_secret";

// --- In-memory "clubs" database ---
const clubs = [
  // Example pre-registered club
  // { id: 1, name: "Music Club", email: "music@univ.com", passwordHash: "hashed_pw_here" }
];

// Helper: sign JWT
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) return res.status(401).json({ error: "Missing Authorization header" });

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "Malformed Authorization header" });

  const token = parts[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.club = decoded;
    next();
  });
}

// --- Club registration route ---
app.post("/api/club-register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

  const exists = clubs.find((c) => c.email === email);
  if (exists) return res.status(400).json({ error: "Club already registered" });

  const hash = await bcrypt.hash(password, 10);
  const newClub = { id: clubs.length + 1, name, email, passwordHash: hash };
  clubs.push(newClub);

  const token = signToken({ id: newClub.id, name: newClub.name, email: newClub.email });
  res.json({ success: true, club: { id: newClub.id, name: newClub.name }, token });
});

// --- Club login route ---
app.post("/api/club-login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const club = clubs.find((c) => c.email === email);
  if (!club) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, club.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: club.id, name: club.name, email: club.email });
  res.json({ success: true, club: { id: club.id, name: club.name }, token });
});

// --- Protected route example (fetch club dashboard info) ---
app.get("/api/club-dashboard", authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.club.name}!`, club: req.club });
});

// Start server
app.listen(PORT, () => {
  console.log(`Club server running on http://localhost:${PORT}`);
});
