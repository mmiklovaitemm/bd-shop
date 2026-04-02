// src/routes/authRoutes.js
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
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// 1. REGISTER
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
    // Naudojame first_name ir last_name kaip DB
    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
      [cleanEmail, passwordHash, firstName || null, lastName || null],
    );

    const userPayload = { userId: result.insertId, role: "user" };
    const token = generateToken(userPayload);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(201).json({
      user: {
        id: result.insertId,
        email: cleanEmail,
        firstName,
        lastName,
        role: "user",
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: err.message });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [cleanEmail],
    );
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const userPayload = { userId: user.id, role: user.role || "user" };
    const token = generateToken(userPayload);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role || "user",
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// 3. LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.json({ ok: true });
});

// 4. ME (Get current user)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, email, first_name, last_name, role FROM users WHERE id = ? LIMIT 1",
      [req.user.userId],
    );

    if (!rows || rows.length === 0) return res.status(401).json({ user: null });

    const user = rows[0];
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name, // Mapinam rankiniu būdu, kad būtų saugu
        lastName: user.last_name,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(401).json({ user: null });
  }
});

// 5. UPDATE PROFILE
router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.userId;

    await db.query(
      "UPDATE users SET first_name = ?, last_name = ? WHERE id = ?",
      [firstName, lastName, userId],
    );

    return res.json({
      message: "Profile updated",
      user: {
        firstName,
        lastName,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

// 6. CHANGE PASSWORD
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
      [userId],
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found." });

    const user = rows[0];

    const isMatch = await bcrypt.compare(
      String(currentPassword),
      user.password_hash,
    );
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const newPasswordHash = await bcrypt.hash(String(newPassword), 10);

    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newPasswordHash,
      userId,
    ]);

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Failed to update password." });
  }
});

export default router;
