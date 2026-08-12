import crypto from "node:crypto";
import { signToken, verifyToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors";

// Single-admin auth backed by environment variables. There is no users table —
// this is an internal admin login, so one credential pair is enough. In a real
// multi-user system you'd store hashed passwords per user in the database.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

// The signing secret. A stable fallback keeps dev zero-config, but warn loudly
// so it never silently ships to production (where tokens must be unforgeable).
export const AUTH_SECRET =
  process.env.JWT_SECRET ?? "dev-insecure-secret-change-me";
if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    "[auth] JWT_SECRET is not set — using an insecure dev default. Set it in .env.",
  );
}

// Tokens last 8 hours: long enough for an admin session, short enough to bound
// the damage if one leaks.
export const TOKEN_TTL_SEC = 8 * 60 * 60;

export interface AdminUser {
  username: string;
  role: "admin";
}

// Constant-time string compare so login can't be timing-attacked. Lengths are
// padded via hashing first (timingSafeEqual requires equal-length buffers).
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Verify credentials and issue a signed JWT. Throws 401 on mismatch. */
export function login(username: string, password: string): {
  token: string;
  user: AdminUser;
} {
  const ok =
    safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD);
  if (!ok) throw new UnauthorizedError("Invalid username or password");

  const user: AdminUser = { username: ADMIN_USERNAME, role: "admin" };
  const token = signToken(
    { sub: user.username, role: user.role },
    AUTH_SECRET,
    TOKEN_TTL_SEC,
  );
  return { token, user };
}

/** Verify a bearer token and return the admin it identifies. Throws 401. */
export function verify(token: string): AdminUser {
  try {
    const payload = verifyToken(token, AUTH_SECRET);
    return { username: payload.sub, role: "admin" };
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
