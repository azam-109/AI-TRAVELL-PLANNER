require("dotenv").config();
const express = require("express");
const helmet  = require("helmet"); // For setting secure HTTP headers
const cors    = require("cors"); // For handling CORS with dynamic origin checking


const authRoutes = require("./routes/auth.routes");

const app = express();

// ── Security & parsing middleware ──────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman) or matching origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok i luv u", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ───────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;