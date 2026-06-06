const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");
const {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
} = require("../middleware/validate");

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login",    validate(loginSchema),    authController.login);
router.post("/refresh",  validate(refreshSchema),  authController.refresh);

// Protected routes
router.post("/logout", authMiddleware, authController.logout);
router.get("/me",      authMiddleware, authController.me);

module.exports = router;