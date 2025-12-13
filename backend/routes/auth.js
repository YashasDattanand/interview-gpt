import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";

const router = express.Router();

// setup lowdb
const file = join(process.cwd(), "db", "users.json");
const adapter = new JSONFile(file);
const db = new Low(adapter, { users: [] });

await db.read();
db.data ||= { users: [] };

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password, batch, course } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const exists = db.data.users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: Date.now(),
    name,
    email,
    password,
    batch,
    course
  };

  db.data.users.push(user);
  await db.write();

  res.json({ success: true });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.data.users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
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
});

export default router;
