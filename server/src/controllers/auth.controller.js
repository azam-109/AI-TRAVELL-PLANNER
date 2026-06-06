const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const BCRYPT_ROUNDS = 12;

/**
 * Formats a user object for API responses (strips passwordHash).
 */
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/auth/register
 * Body: { email, password, name }
 */
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    // Check for existing email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    return res.status(201).json({
      user: formatUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    return res.status(200).json({
      user: formatUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken is required" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const accessToken = signAccessToken(payload.sub);

    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error("refresh error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/auth/logout
 * Requires Bearer token (validated by authMiddleware)
 * Phase 1: stateless — token is NOT blocklisted
 */
async function logout(req, res) {
  // Stateless logout in Phase 1 — token expires naturally
  // Phase 5 will add Redis-backed blocklisting
  return res.status(204).send();
}

/**
 * GET /api/auth/me
 * Requires Bearer token (validated by authMiddleware)
 */
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user: formatUser(user) });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { register, login, refresh, logout, me };