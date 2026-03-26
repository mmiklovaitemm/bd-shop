import express from "express";
import { upload, makeSafeBaseName } from "../config/upload.js";
import { requireAdmin } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

function uploadToCloudinary(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
}

router.post(
  "/product-image",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required." });
      }

      const category =
        typeof req.body.category === "string" && req.body.category.trim()
          ? req.body.category.trim().toLowerCase()
          : "misc";

      const allowedCategories = [
        "rings",
        "necklaces",
        "bracelets",
        "earrings",
        "personal",
      ];

      const safeCategory = allowedCategories.includes(category)
        ? category
        : "misc";

      const originalName = req.file.originalname || "image";
      const publicIdBase =
        makeSafeBaseName(originalName) || `image-${Date.now()}`;

      const result = await uploadToCloudinary(req.file.buffer, {
        folder: `bd-shop/${safeCategory}`,
        resource_type: "image",
        public_id: `${Date.now()}-${publicIdBase}`,
        use_filename: false,
        unique_filename: false,
      });

      const imageUrl = result?.secure_url || result?.url || "";

      if (!imageUrl) {
        return res
          .status(500)
          .json({ message: "Cloudinary did not return image URL." });
      }

      return res.status(201).json({
        ok: true,
        file: {
          filename: result.public_id,
          url: imageUrl,
        },
      });
    } catch (err) {
      console.error("Upload image error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
);

export default router;
