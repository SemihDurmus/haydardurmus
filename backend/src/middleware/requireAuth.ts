import type { Request, Response, NextFunction } from "express";
import { verify } from "../services/auth";
import { UnauthorizedError } from "../utils/errors";

// Gate a route behind admin auth. Reads the bearer token from the
// Authorization header, verifies it, and attaches the admin to req.admin so
// handlers downstream know who's calling. Any failure becomes a 401 via the
// errorHandler. Placed in the chain like validate(): before the controller.
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(new UnauthorizedError("Missing bearer token"));
    return;
  }

  try {
    req.admin = verify(token);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional counterpart to requireAuth: identify the caller if they present a
 * valid token, but never reject them. Mounted on /api ahead of the write guard
 * so that GET handlers — which the guard lets through unauthenticated — can
 * still tell an admin from a visitor and widen the response accordingly
 * (see services/painting.ts, where only admins get the owner record).
 *
 * An invalid or expired token is treated as no token at all. This endpoint
 * family is public either way, so failing the request would only turn a stale
 * browser session into a broken gallery.
 */
export function attachAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme === "Bearer" && token) {
    try {
      req.admin = verify(token);
    } catch {
      // Anonymous. Deliberately silent — see the note above.
    }
  }

  next();
}

export default requireAuth;
