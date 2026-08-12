import rateLimit, { type Options } from "express-rate-limit";
import { TooManyRequestsError } from "../utils/errors";

// Rate limiters for the two endpoints the write guard deliberately leaves
// public: admin login and the contact form. Everything else under /api either
// requires a bearer token or is a read, so those are the only doors an
// anonymous client can push on.
//
// Limits are per client IP. On Railway the app sits behind a proxy, so
// `app.set("trust proxy", 1)` in app.ts is what makes req.ip the real caller
// instead of the proxy's address — without it every request looks like one
// client and the limiter would lock out the whole internet at once.
//
// Failures are routed through next() so they land in errorHandler and come back
// in the same `{ error }` shape as every other error the API produces.
const shared: Partial<Options> = {
  standardHeaders: "draft-8", // RateLimit-* response headers
  legacyHeaders: false, // no X-RateLimit-* (superseded)
};

/**
 * Admin login. Deliberately tight: there is exactly one admin account and its
 * username is guessable, so the password is the only secret. 5 attempts per
 * 15 minutes per IP makes online guessing useless without inconveniencing a
 * human who fat-fingered their password twice.
 *
 * `skipSuccessfulRequests` means a correct login doesn't consume the budget —
 * only failures count, so a working admin is never locked out by their own
 * session activity.
 */
export const loginLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  handler: (_req, _res, next) => {
    next(
      new TooManyRequestsError(
        "Too many login attempts. Please try again later.",
      ),
    );
  },
});

/**
 * Public contact form. Looser — this one is used by real visitors — but capped
 * so the admin inbox can't be script-flooded. 5 messages per hour per IP is
 * far more than any genuine visitor sends.
 */
export const contactLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  handler: (_req, _res, next) => {
    next(
      new TooManyRequestsError(
        "Too many messages sent. Please try again later.",
      ),
    );
  },
});
