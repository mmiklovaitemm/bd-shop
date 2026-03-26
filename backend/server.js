import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

import db from "./db.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:4173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// test endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// DB test
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATABASE() AS db_name,
        USER() AS db_user,
        @@hostname AS db_host
    `);

    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
