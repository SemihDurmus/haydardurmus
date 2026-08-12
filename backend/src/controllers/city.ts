import type { Request, Response, NextFunction } from "express";
import * as service from "../services/city";
import { parsePagination, paginated } from "../utils/pagination";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    // Pagination from the raw query; the validated filters from req.valid.query.
    const pg = parsePagination(req.query);
    const q = req.valid?.query ?? {};
    const { items, total } = await service.list({
      ...pg,
      countryId: q.countryId as number | undefined,
      name: q.name as string | undefined,
      search: q.search as string | undefined,
    });
    res.json(paginated(items, total, pg));
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
