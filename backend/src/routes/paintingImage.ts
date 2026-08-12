import { Router } from "express";
import { z, registry } from "../openapi/registry";
import {
  IdParam,
  PaginationQuery,
  ErrorResponse,
  ValidationErrorResponse,
  paginated,
  jsonBody,
  jsonResponse,
  emptyResponse,
} from "../openapi/common";
import * as controller from "../controllers/paintingImage";
import { validate } from "../middleware/validate";

const router = Router();

const PaintingImage = z
  .object({
    id: z.number().int(),
    paintingId: z.number().int(),
    paintingNo: z.string().max(50).openapi({
      description:
        "The painting's physical number, copied from the parent painting. Read-only: the database fills and maintains it, so it is never accepted on write.",
      example: "8597",
    }),
    filePath: z.string().max(500),
    isPrimary: z.boolean(),
    uploadedAt: z.string().datetime(),
  })
  .openapi("PaintingImage");

const PaintingImageCreate = z
  .object({
    paintingId: z.coerce.number().int().positive().openapi({ example: 1 }),
    filePath: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .openapi({ example: "/uploads/ohb-001-full.jpg" }),
    isPrimary: z.boolean().optional().default(false),
  })
  .openapi("PaintingImageCreate", {
    description:
      "Setting `isPrimary: true` atomically demotes any previously-primary image for the same painting. " +
      "`paintingNo` is not accepted here — the database derives it from `paintingId`.",
  });

const PaintingImageUpdate = z
  .object({
    filePath: z.string().trim().min(1).max(500).optional(),
    isPrimary: z.boolean().optional(),
  })
  .openapi("PaintingImageUpdate", {
    description:
      "At least one field required. Setting `isPrimary: true` demotes the prior primary atomically.",
  });

const PaintingImageUpdateRuntime = PaintingImageUpdate.refine(
  (d) => Object.keys(d).length > 0,
  { message: "Provide at least one field to update" },
);

const PaintingImageList = paginated(PaintingImage, "PaintingImageList");

const PaintingImageListQuery = z.object({
  paintingId: z.coerce.number().int().positive().optional(),
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Painting Images";
const basePath = "/api/painting-images";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List images (optionally filtered by paintingId)",
  request: { query: PaintingImageListQuery },
  responses: { 200: jsonResponse("Paginated list", PaintingImageList) },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get an image by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The image", PaintingImage),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create an image record",
  request: { body: jsonBody(PaintingImageCreate) },
  responses: {
    201: jsonResponse("Created", PaintingImage),
    400: jsonResponse("Validation failed or bad FK", ValidationErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update an image (partial)",
  request: { params: IdParam, body: jsonBody(PaintingImageUpdate) },
  responses: {
    200: jsonResponse("Updated", PaintingImage),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete an image",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

router.get("/", validate({ query: PaintingImageListQuery }), controller.list);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: PaintingImageCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: PaintingImageUpdateRuntime }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
