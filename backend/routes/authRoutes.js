import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const COOKIE_NAME = "access_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function setAuthCookie(res, payload) {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables!");
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [cleanEmail],
    );

    if (existing.length) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
      [cleanEmail, passwordHash, firstName || null, lastName || null],
    );

    const user = {
      id: result.insertId,
      email: cleanEmail,
      firstName: firstName || null,
      lastName: lastName || null,
      role: "user",
    };

    setAuthCookie(res, { userId: user.id, role: "user" });

    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [cleanEmail],
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    setAuthCookie(res, {
      userId: user.id,
      role: user.role || "user",
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || "user",
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE id = ? LIMIT 1",
      [userId],
    );

    if (!rows.length) {
      return res.status(401).json({ user: null });
    }

    const user = rows[0];

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.log("Auth error:", err);
    return res.status(401).json({ user: null });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });

  res.json({ ok: true });
});

router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required." });
    }

    const [rows] = await db.query(
      "SELECT id, password_hash FROM users WHERE id = ? LIMIT 1",
      [userId],
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(
      String(currentPassword),
      user.password_hash,
    );

    if (!ok) {
      return res.status(401).json({ message: "Wrong current password." });
    }

    const newHash = await bcrypt.hash(String(newPassword), 10);

    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newHash,
      userId,
    ]);

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
