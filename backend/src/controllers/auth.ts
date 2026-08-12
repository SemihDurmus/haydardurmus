import type { Request, Response, NextFunction } from "express";
import * as service from "../services/auth";

// POST /api/auth/login — exchange credentials for a JWT. Public.
export function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.valid!.body;
    res.json(service.login(username, password));
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me — echo the current admin. requireAuth has already verified
// the token and populated req.admin, so this just returns it (used by the
// frontend to confirm a stored token is still valid on load).
export function me(req: Request, res: Response) {
  res.json({ user: req.admin });
}
