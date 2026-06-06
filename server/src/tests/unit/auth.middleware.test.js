process.env.JWT_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

const authMiddleware = require("../../src/middleware/auth");
const { signAccessToken } = require("../../src/utils/jwt");

function mockReqRes(authHeader) {
  const req = { headers: { authorization: authHeader } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe("Auth Middleware", () => {
  const userId = "550e8400-e29b-41d4-a716-446655440001";

  it("should call next() and set req.user for a valid token", () => {
    const token = signAccessToken(userId);
    const { req, res, next } = mockReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ sub: userId });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header is missing", () => {
    const { req, res, next } = mockReqRes(undefined);

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 when token is malformed", () => {
    const { req, res, next } = mockReqRes("Bearer not-a-real-token");

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 with expired token message when token is expired", () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign(
      { sub: userId },
      process.env.JWT_SECRET,
      { expiresIn: -1 } // already expired
    );

    const { req, res, next } = mockReqRes(`Bearer ${expiredToken}`);

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("expired") })
    );
  });
});