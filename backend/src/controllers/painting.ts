import type { Request, Response, NextFunction } from "express";
import * as service from "../services/painting";
import * as imageService from "../services/paintingImage";
import { parsePagination, paginated } from "../utils/pagination";
import { parseIdSlug } from "../utils/slug";
import { BadRequestError, NotFoundError } from "../utils/errors";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const pg = parsePagination(req.query);
    const q = req.valid?.query ?? {};
    const { items, total } = await service.list({
      ...pg,
      artistId: q.artistId as number | undefined,
      ownerId: q.ownerId as number | undefined,
      techniqueId: q.techniqueId as number | undefined,
      materialId: q.materialId as number | undefined,
      locationCityId: q.locationCityId as number | undefined,
      available: q.available as boolean | undefined,
      minPrice: q.minPrice as number | undefined,
      maxPrice: q.maxPrice as number | undefined,
      search: q.search as string | undefined,
      // req.admin is set by requireAuth. Anonymous callers get the public
      // graph (no owner); the admin panel, which sends a token, gets the full one.
      forAdmin: Boolean(req.admin),
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
    if (Number.isNaN(id)) throw new NotFoundError("Painting not found");
    res.json(await service.get(id, Boolean(req.admin)));
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.get(req.valid!.params.id, Boolean(req.admin)));
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

// POST /api/paintings/:id/images — multipart upload. multer has already written
// the file to public/paintings/<id>/; here we record it. The first image for a
// painting becomes its primary; later ones are added non-primary.
export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.valid!.params.id as number;
    if (!req.file) throw new BadRequestError("No image file (form field 'image')");
    const filePath = `/images/paintings/${id}/${req.file.filename}`;
    const { total } = await imageService.list({ skip: 0, take: 1, paintingId: id });
    const created = await imageService.create({
      paintingId: id,
      filePath,
      isPrimary: total === 0,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}
