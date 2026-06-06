const { z } = require("zod");

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure, responds 400 with the list of validation errors.
 *
 * @param {z.ZodTypeAny} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    req.body = result.data; // Replace body with parsed + coerced data
    next();
  };
}

// ── Schemas ────────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

module.exports = { validate, registerSchema, loginSchema, refreshSchema };