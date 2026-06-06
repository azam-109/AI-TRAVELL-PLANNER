const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../../src/utils/jwt");

// Set required env vars before tests
process.env.JWT_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

describe("JWT Utilities", () => {
  const userId = "550e8400-e29b-41d4-a716-446655440000";

  describe("signAccessToken / verifyAccessToken", () => {
    it("should sign and verify an access token successfully", () => {
      const token = signAccessToken(userId);
      const payload = verifyAccessToken(token);
      expect(payload.sub).toBe(userId);
    });

    it("should throw when verifying with wrong secret", () => {
      const token = signAccessToken(userId);
      // Tamper by using refresh secret
      expect(() => verifyRefreshToken(token)).toThrow();
    });
  });

  describe("signRefreshToken / verifyRefreshToken", () => {
    it("should sign and verify a refresh token successfully", () => {
      const token = signRefreshToken(userId);
      const payload = verifyRefreshToken(token);
      expect(payload.sub).toBe(userId);
    });

    it("should throw when verifying refresh token with access secret", () => {
      const token = signRefreshToken(userId);
      expect(() => verifyAccessToken(token)).toThrow();
    });
  });
});