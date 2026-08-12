import type { Request, Response, NextFunction } from "express";
import * as service from "../services/nationality";
import { parsePagination, paginated } from "../utils/pagination";

// Controllers are HTTP glue: read validated input off req, call the service,
// shape the response and status. Each wraps its work in try/catch and funnels
// any error to next(err) so the central errorHandler decides the status.

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const pg = parsePagination(req.query);
    const q = req.valid?.query ?? {};
    const { items, total } = await service.list({
      ...pg,
      name: q.name as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginated(items, total, pg));
  } catch (err) {
    next(err);
  }
}

// req.valid is populated by the validate() middleware; the `!` asserts it's
// present because this handler only runs after validation succeeded.
export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.get(req.valid!.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await service.create(req.valid!.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.update(req.valid!.params.id, req.valid!.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.remove(req.valid!.params.id);
    res.status(204).send(); // 204 No Content — nothing in the body.
  } catch (err) {
    next(err);
  }
}
