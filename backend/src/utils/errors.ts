// Typed errors the service layer throws and the errorHandler maps to HTTP.
// Each carries the status code it should become, so a service can stay
// HTTP-agnostic ("not found") while the handler turns it into a 404.

export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown; // typed `unknown` so callers must narrow before using it.

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    // Only attach details when given, so `details` stays absent (not
    // `undefined`) on errors that don't carry extra context.
    if (details !== undefined) this.details = details;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict", details?: unknown) {
    super(409, message, details);
  }
}

// Thrown by the rate limiters (middleware/rateLimit.ts) so a throttled request
// comes back in the same `{ error }` shape as every other failure.
export class TooManyRequestsError extends HttpError {
  constructor(message = "Too many requests") {
    super(429, message);
  }
}
