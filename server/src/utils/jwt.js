const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Signs an access token with the user's ID as payload.
 * @param {string} userId - UUID of the user
 * @returns {string} Signed JWT access token
 */
function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Signs a refresh token with the user's ID as payload.
 * @param {string} userId - UUID of the user
 * @returns {string} Signed JWT refresh token
 */
function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verifies an access token and returns the decoded payload.
 * @param {string} token - JWT access token
 * @returns {{ sub: string }} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * Verifies a refresh token and returns the decoded payload.
 * @param {string} token - JWT refresh token
 * @returns {{ sub: string }} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};