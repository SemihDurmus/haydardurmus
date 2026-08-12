import type { Request, Response, NextFunction } from "express";
import * as service from "../services/price";
import { parsePagination, paginated } from "../utils/pagination";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const pg = parsePagination(req.query);
    const q = req.valid?.query ?? {};
    const { items, total } = await service.list({
      ...pg,
      paintingId: q.paintingId as number | undefined,
      currentOnly: q.currentOnly as boolean | undefined,
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
