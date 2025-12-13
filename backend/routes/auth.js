import express from "express";
import bcrypt from "bcrypt";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup DB
const dbFile = path.join(__dirname, "../db/users.json");
const adapter = new JSONFile(dbFile);

// 👇 THIS IS THE CRITICAL FIX
const db = new Low(adapter, { users: [] });

await db.read();
db.data ||= { users: [] };

const router = express.Router();

// =======================
// SIGNUP
// =======================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, batch, course, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existing = db.data.users.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.data.users.push({
      id: Date.now(),
      name,
      email,
      phone,
      batch,
      course,
      password: hashed
    });

    await db.write();
    res.json({ success: true });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// =======================
// LOGIN
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        batch: user.batch,
        course: user.course
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
