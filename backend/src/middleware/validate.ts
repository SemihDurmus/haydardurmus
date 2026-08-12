import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

// A route passes the zod schemas for whichever request parts it cares about.
export interface ValidateSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

// Factory: returns middleware that parses each present part and stores the
// typed result on req.valid. parse() throws a ZodError on bad input, which we
// forward to next(err) — the errorHandler (Brick 5.5) turns it into a 400.
export function validate(schemas: ValidateSchemas): RequestHandler {
  // validate(schemas)` returns Express middleware (a closure over those schemas)
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.valid = {};
      if (schemas.body) req.valid.body = schemas.body.parse(req.body); // Zod's .parse() method is used to validate and parse data according to a defined schema.
      if (schemas.params) req.valid.params = schemas.params.parse(req.params);
      if (schemas.query) req.valid.query = schemas.query.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export default validate;
