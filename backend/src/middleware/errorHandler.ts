import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/errors";

// We detect Prisma's known-request errors structurally rather than via
// `instanceof PrismaClientKnownRequestError`. Under the driver-adapter setup the
// thrown instance can come from a different copy of the client, so a duck-typed
// check (a string `code` starting with "P" plus a `clientVersion`) is reliable.
interface PrismaKnownError {
  code: string;
  meta?: Record<string, unknown>;
  clientVersion: string;
}

function isPrismaKnownError(err: unknown): err is PrismaKnownError {
  if (!err || typeof err !== "object") return false;
  const candidate = err as Record<string, unknown>;
  return (
    typeof candidate.code === "string" &&
    candidate.code.startsWith("P") &&
    typeof candidate.clientVersion === "string"
  );
}

// Under the driver adapter, not every Postgres constraint violation is
// translated into a Prisma P-code. Some (notably ON DELETE RESTRICT, SQLSTATE
// 23001) surface as a raw DriverAdapterError carrying the Postgres SQLSTATE on
// `err.cause`. We detect that shape and map the integrity-violation family
// (class 23) ourselves, so they don't fall through to a 500.
interface PgDriverError {
  cause: { kind: string; code: string; detail?: string };
}

function isPgDriverError(err: unknown): err is PgDriverError {
  if (!err || typeof err !== "object") return false;
  const cause = (err as Record<string, unknown>).cause;
  if (!cause || typeof cause !== "object") return false;
  const c = cause as Record<string, unknown>;
  return c.kind === "postgres" && typeof c.code === "string";
}

function handlePgError(
  err: PgDriverError,
): { status: number; body: Record<string, unknown> } | null {
  switch (err.cause.code) {
    case "23505": // unique_violation
      return { status: 409, body: { error: "Unique constraint violation" } };
    case "23503": // foreign_key_violation (bad FK reference)
    case "23001": // restrict_violation (delete blocked by ON DELETE RESTRICT)
      return { status: 400, body: { error: "Foreign key constraint failed" } };
    case "23502": // not_null_violation
    case "23514": // check_violation
      return { status: 400, body: { error: "Constraint violation" } };
    default:
      return null; // not a constraint error we map — let it fall through to 500
  }
}

// Map the Prisma error codes we expect to the right HTTP status + shape.
function handlePrismaError(err: PrismaKnownError): {
  status: number;
  body: Record<string, unknown>;
} {
  switch (err.code) {
    case "P2002": // unique constraint — e.g. duplicate name
      return {
        status: 409,
        body: {
          error: "Unique constraint violation",
          fields: err.meta?.target,
        },
      };
    case "P2003": // foreign key constraint — bad FK or delete RESTRICT
      return {
        status: 400,
        body: {
          error: "Foreign key constraint failed",
          field: err.meta?.field_name,
        },
      };
    case "P2025": // record required by the operation was not found
      return { status: 404, body: { error: "Record not found" } };
    default:
      return {
        status: 400,
        body: { error: "Database error", code: err.code },
      };
  }
}

// The terminal error handler. Express recognizes it by its 4 args. It must be
// the LAST app.use(), after every router, so any next(err) lands here.
// Order of checks: our own HttpError, then ZodError, then Prisma, else 500.

// ErrorRequestHandler` is the type **of the `errorHandler` variable itself** — i.e. the type of the whole function — not its return type.
// ErrorRequestHandler` is a function type that describes the **parameters** (4 args: `err, req, res, next`) and the return type. The function it describes actually returns `void` (the `return;` statements just exit early; nothing is returned).
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", issues: err.issues });
    return;
  }

  if (isPrismaKnownError(err)) {
    const { status, body } = handlePrismaError(err);
    res.status(status).json(body);
    return;
  }

  // Raw driver-adapter Postgres errors that Prisma didn't normalize.
  if (isPgDriverError(err)) {
    const mapped = handlePgError(err);
    if (mapped) {
      res.status(mapped.status).json(mapped.body);
      return;
    }
  }

  // Anything unexpected: log it for us, but don't leak internals to the client.
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
