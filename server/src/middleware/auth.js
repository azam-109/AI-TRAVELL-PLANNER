const { verifyAccessToken } = require("../utils/jwt");

/**
 * Middleware that verifies the Bearer JWT in the Authorization header.
 * Sets req.user = { sub: userId } on success.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing or malformed" });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const payload = verifyAccessToken(token);
    req.user = { sub: payload.sub };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }
    return res.status(401).json({ error: "Invalid access token" });
  }
}

module.exports = authMiddleware;