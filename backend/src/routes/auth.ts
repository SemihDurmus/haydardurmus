import { Router } from "express";
import { z, registry } from "../openapi/registry";
import { ErrorResponse, jsonBody, jsonResponse } from "../openapi/common";
import * as controller from "../controllers/auth";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";
import { loginLimiter } from "../middleware/rateLimit";

const router = Router();

// Register the bearer scheme once so the docs show a padlock and a "Authorize"
// box; protected operations reference it via `security: [{ bearerAuth: [] }]`.
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const AdminUser = z
  .object({
    username: z.string(),
    role: z.literal("admin"),
  })
  .openapi("AdminUser");

// Placeholder examples only. Never put the real (or default) credentials here:
// they end up in /docs and in the generated openapi.json, which is exactly the
// pair someone probing the API would try first.
const LoginBody = z
  .object({
    username: z.string().min(1).openapi({ example: "your-admin-username" }),
    password: z.string().min(1).openapi({ example: "your-admin-password" }),
  })
  .openapi("LoginBody");

const LoginResponse = z
  .object({
    token: z.string().openapi({ description: "JWT bearer token" }),
    user: AdminUser,
  })
  .openapi("LoginResponse");

const MeResponse = z.object({ user: AdminUser }).openapi("MeResponse");

const tag = "Auth";

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: [tag],
  summary: "Log in as the admin and receive a JWT",
  request: { body: jsonBody(LoginBody) },
  responses: {
    200: jsonResponse("Authenticated", LoginResponse),
    401: jsonResponse("Invalid credentials", ErrorResponse),
    429: jsonResponse("Too many login attempts", ErrorResponse),
  },
});

registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  tags: [tag],
  summary: "Return the currently authenticated admin",
  security: [{ bearerAuth: [] }],
  responses: {
    200: jsonResponse("The current admin", MeResponse),
    401: jsonResponse("Missing or invalid token", ErrorResponse),
  },
});

// loginLimiter runs before validation so malformed floods are throttled too.
router.post(
  "/login",
  loginLimiter,
  validate({ body: LoginBody }),
  controller.login,
);
router.get("/me", requireAuth, controller.me);

export default router;
