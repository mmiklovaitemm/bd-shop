import express from "express";
import { upload } from "../config/upload.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/product-image",
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required." });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

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
