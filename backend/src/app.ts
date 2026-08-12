import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { apiReference } from "@scalar/express-api-reference";
import { PUBLIC_ROOT } from "./config/paths";
import { errorHandler } from "./middleware/errorHandler";
import { requireAuth, attachAdmin } from "./middleware/requireAuth";
import { contactLimiter } from "./middleware/rateLimit";
import { openapiDocument } from "./openapi/spec";
import authRouter from "./routes/auth";
import nationalityRouter from "./routes/nationality"; // It's a **default export**, which can be imported under any name you choose.
import techniqueRouter from "./routes/technique";
import materialRouter from "./routes/material";
import currencyRouter from "./routes/currency";
import countryRouter from "./routes/country";
import cityRouter from "./routes/city";
import artistRouter from "./routes/artist";
import ownerRouter from "./routes/owner";
import paintingRouter from "./routes/painting";
import paintingImageRouter from "./routes/paintingImage";
import priceRouter from "./routes/price";
import contactMessageRouter from "./routes/contactMessage";

const app = express();

// Railway (like any PaaS) puts a reverse proxy in front of the app, so the
// socket's remote address is the proxy, not the visitor. Trusting exactly one
// hop makes req.ip the real client — which is what the rate limiters key on.
// `1` rather than `true`: a blanket trust lets a caller forge X-Forwarded-For
// and sidestep every per-IP limit.
app.set("trust proxy", 1);

// Browser origins allowed to call this API. In production set CORS_ORIGIN to
// the frontend's URL — comma-separated for several (e.g. apex + www). Left
// unset it falls back to the local dev servers, so nothing is wide open by
// default. Note this only constrains *browsers*: CORS is enforced client-side,
// so server-to-server calls and curl are unaffected (the write guard below is
// what actually protects mutations).
const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:4173"];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : DEV_ORIGINS;

// Global middleware. Order matters: these run for every request, top to bottom.
// - helmet(): security response headers (nosniff, frameguard, HSTS, …).
// - cors(): permit cross-origin browser requests (the frontend lives elsewhere).
// - express.json(): parse a JSON request body into req.body.
//
// Two helmet defaults are overridden, both because this API is consumed from a
// different origin than it's served from:
// - crossOriginResourcePolicy would default to same-origin and block the SPA
//   from rendering <img src="https://<api>/images/…">. The frontend and API
//   have separate domains, so painting images must be cross-origin readable.
// - contentSecurityPolicy's default would break the Scalar docs UI, which
//   needs inline scripts. CSP protects HTML documents; this app serves JSON
//   and images, so there's little to protect and a real cost to keeping it.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Serve uploaded painting images from disk. Files live under PUBLIC_ROOT
// (e.g. <PUBLIC_ROOT>/paintings/<id>/<file>.jpg) and are exposed at /images/* —
// so /images/paintings/12/169....jpg maps to that file. See config/paths.ts:
// locally that's backend/public; in production it's the mounted volume.
app.use("/images", express.static(PUBLIC_ROOT));

// Liveness probe. Cheap, dependency-free: it proves the process is up and
// answering, without touching the database. `uptime` is seconds since boot.
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// API docs. The raw spec at /docs/openapi.json (machine-readable), and the
// interactive Scalar UI at /docs (human-readable, with live "Try it out").
// Set ENABLE_DOCS=false to omit both — recommended on a public deployment,
// where advertising every endpoint is free reconnaissance. Omitted routes
// simply fall through to the 404 handler.
//
// The value is normalised before comparing: dotenv strips surrounding quotes
// from .env files, but host dashboards (Railway included) store them verbatim,
// so a pasted `"false"` would otherwise leave the docs wide open in production.
const docsFlag = (process.env.ENABLE_DOCS ?? "")
  .trim()
  .replace(/^["']|["']$/g, "")
  .toLowerCase();

if (docsFlag !== "false") {
  app.get("/docs/openapi.json", (_req: Request, res: Response) => {
    res.json(openapiDocument);
  });
  app.use("/docs", apiReference({ content: openapiDocument }));
}

// Auth router (login is public; /me self-guards). Mounted BEFORE the write
// guard below so login isn't gated by it.
app.use("/api/auth", authRouter);

// Write guard: reads stay public (the gallery is public), but every mutation
// under /api requires an admin bearer token — this is what makes the admin
// panel an *admin* panel. One exception: POST /api/contact-messages is the
// public contact form. (Reading/curating those messages is still admin-only;
// that's enforced inside the contact-messages router on its GET routes.)
// Identify the caller without demanding a token, so read handlers can tell an
// admin from a visitor. Must run BEFORE the write guard, which short-circuits
// GETs and would otherwise leave req.admin unset for every read.
app.use("/api", attachAdmin);

app.use("/api", (req, res, next) => {
  if (req.method === "GET") return next();
  // The public form is throttled instead of authenticated — without a limit,
  // the admin inbox is one loop away from unusable. See middleware/rateLimit.ts.
  if (req.method === "POST" && req.path === "/contact-messages") {
    return contactLimiter(req, res, next);
  }
  return requireAuth(req, res, next);
});

// Resource routers. Mounted above the 404 so their paths match first.
// a request that matches nothing falls through to the 404 handler and ends there. errorHandler is skipped.
app.use("/api/nationalities", nationalityRouter); // app.use(path, callback)
app.use("/api/techniques", techniqueRouter);
app.use("/api/materials", materialRouter);
app.use("/api/currencies", currencyRouter);
app.use("/api/countries", countryRouter);
app.use("/api/cities", cityRouter);
app.use("/api/artists", artistRouter);
app.use("/api/owners", ownerRouter);
app.use("/api/paintings", paintingRouter);
app.use("/api/painting-images", paintingImageRouter);
app.use("/api/prices", priceRouter);
app.use("/api/contact-messages", contactMessageRouter);

// Catch-all 404. Express tries routes in registration order; reaching this
// handler means nothing above matched. It must stay LAST among request
// handlers (resource routers will be inserted *above* it as we add them).
// if any router/handler above calls `next(err)` or throws,
// Express jumps straight past all regular middleware to `errorHandler`.
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// Terminal error handler — must stay the very last app.use(), after the 404,
// so anything passed to next(err) anywhere above is mapped to a JSON response.
// (The /api/* routers are still to come in Phase 6+, inserted above the 404.)
// next()` with **no argument** → go to the next *regular* handler/middleware
// - `next(err)` with **any argument** → skip all remaining regular middleware and jump to the next *error* handler (4-arg)
app.use(errorHandler);

export default app;
