import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import bcrypt from "bcrypt";

const router = express.Router();
const db = new Low(new JSONFile("./db/users.json"));
await db.read();
db.data ||= { users: [] };

router.post("/signup", async (req, res) => {
  const { name, email, phone, batch, course, password } = req.body;

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
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.data.users.find(u => u.email === email);
  if (!user) return res.status(401).send("Invalid");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send("Invalid");

  res.json({ success: true, user });
});

export default router;
