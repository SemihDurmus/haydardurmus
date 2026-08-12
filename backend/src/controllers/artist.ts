import type { Request, Response, NextFunction } from "express";
import * as service from "../services/artist";
import { parsePagination, paginated } from "../utils/pagination";
import { parseIdSlug } from "../utils/slug";
import { NotFoundError } from "../utils/errors";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const pg = parsePagination(req.query);
    const q = req.valid?.query ?? {};
    const { items, total } = await service.list({
      ...pg,
      nationalityId: q.nationalityId as number | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginated(items, total, pg));
  } catch (err) {
    next(err);
  }
}

// id+slug hybrid lookup: GET /by-slug/:slug. Only the leading id is trusted; the
// rest of the slug is decorative. A slug with no leading id → 404.
export async function getBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseIdSlug(req.valid!.params.slug as string);
    if (Number.isNaN(id)) throw new NotFoundError("Artist not found");
    res.json(await service.get(id));
  } catch (err) {
    next(err);
  }
}

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
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
