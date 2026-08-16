// Module augmentation: teach TypeScript that Express's Request can carry a
// `valid` bag. The validate() middleware fills it with parsed, typed data so
// controllers read from req.valid.* instead of the untyped req.body/params/query.
//
// `export {}` makes this file a module; without it, `declare global` would be
// treated as a plain script and the augmentation wouldn't merge correctly.
export {}; // export {}` makes the file a module so
// `declare global` * augments * Express's existing `Request` rather than redefining it.

declare global {
  namespace Express {
    interface Request {
      valid?: {
        body?: any;
        params?: any;
        query?: any;
      };
      // Set by requireAuth once a valid admin bearer token is verified.
      admin?: {
        username: string;
        role: "admin";
      };
      // Set by resolvePaintingFolder (middleware/upload.ts) before multer runs.
      // Images are filed under the painting's number, not its id, so the
      // destination callback needs it resolved ahead of the first byte written.
      paintingNo?: string;
    }
  }
}
