import express from "express";
import fs from "fs";
import { upload } from "../config/upload.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN ||
  process.env.API_ORIGIN ||
  "http://localhost:4000";

router.post(
  "/product-image",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required." });
      }

      console.log("UPLOAD FILE PATH:", req.file.path);
      console.log("UPLOAD FILE EXISTS:", fs.existsSync(req.file.path));

      const base = String(BACKEND_ORIGIN).replace(/\/+$/, "");
      const fileUrl = `${base}/uploads/${req.file.filename}`;

      return res.status(201).json({
        ok: true,
        file: {
          filename: req.file.filename,
          url: fileUrl,
        },
      });
    } catch (err) {
      console.error("Upload image error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
);

export default router;
