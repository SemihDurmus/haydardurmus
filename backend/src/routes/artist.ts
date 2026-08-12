import { Router } from "express";
import { z, registry } from "../openapi/registry";
import {
  IdParam,
  SlugParam,
  PaginationQuery,
  NameSearchQuery,
  ErrorResponse,
  ValidationErrorResponse,
  paginated,
  jsonBody,
  jsonResponse,
  emptyResponse,
} from "../openapi/common";
import * as controller from "../controllers/artist";
import { validate } from "../middleware/validate";

const router = Router();

const NationalityRef = z.object({ id: z.number().int(), name: z.string() });

const Artist = z
  .object({
    id: z.number().int(),
    // Decorative id+slug for pretty frontend URLs; the id stays authoritative.
    slug: z.string().openapi({ example: "1-osman-hamdi-bey" }),
    nationalityId: z.number().int(),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    birthdate: z.string().datetime().nullable(),
    description: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    nationality: NationalityRef.optional(),
    _count: z.object({ paintings: z.number().int() }).optional(),
  })
  .openapi("Artist");

// First field with a shape constraint beyond length: a YYYY-MM-DD calendar date.
// Prisma 7 requires a full ISO-8601 DateTime even for an @db.Date column, so we
// validate the human-friendly YYYY-MM-DD then transform it to a Date before it
// reaches the service. The public API contract stays YYYY-MM-DD.
// (The explicit .openapi({type,format}) gives zod-to-openapi the doc shape it
// can't infer through the transform.)
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "birthdate must be YYYY-MM-DD")
  .openapi({ type: "string", format: "date", example: "1842-12-30" })
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

const ArtistCreate = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .openapi({ example: "Osman Hamdi" }),
    lastName: z.string().trim().min(1).max(100).openapi({ example: "Bey" }),
    nationalityId: z.coerce.number().int().positive().openapi({ example: 4 }),
    // optional() = key may be absent; nullable() = key may be null (both columns
    // are nullable, and the client may omit or explicitly clear them).
    birthdate: isoDate.optional().nullable(),
    description: z.string().trim().max(10000).optional().nullable(),
  })
  .openapi("ArtistCreate");

// Partial update: every field optional, so a PUT can send just what changes.
const ArtistUpdate = ArtistCreate.partial().openapi("ArtistUpdate");

const ArtistList = paginated(Artist, "ArtistList");

const ArtistListQuery = z.object({
  nationalityId: z.coerce.number().int().positive().optional(),
  // ?search= matches first OR last name (case-insensitive partial).
  search: NameSearchQuery.shape.search,
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Artists";
const basePath = "/api/artists";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List artists (optionally filtered by nationalityId)",
  request: { query: ArtistListQuery },
  responses: {
    200: jsonResponse("Paginated list with nationality", ArtistList),
  },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get an artist by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The artist (with painting count)", Artist),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/by-slug/{slug}`,
  tags: [tag],
  summary: "Get an artist by id+slug (pretty URL; only the leading id matters)",
  request: { params: SlugParam },
  responses: {
    200: jsonResponse("The artist", Artist),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create an artist",
  request: { body: jsonBody(ArtistCreate) },
  responses: {
    201: jsonResponse("Created", Artist),
    400: jsonResponse("Validation failed or bad FK", ValidationErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update an artist (partial)",
  request: { params: IdParam, body: jsonBody(ArtistUpdate) },
  responses: {
    200: jsonResponse("Updated", Artist),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete an artist",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    400: jsonResponse(
      "Foreign key constraint failed (artist has paintings)",
      ErrorResponse,
    ),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

router.get("/", validate({ query: ArtistListQuery }), controller.list);
// by-slug must precede /:id so "/by-slug/..." isn't swallowed as an id.
router.get(
  "/by-slug/:slug",
  validate({ params: SlugParam }),
  controller.getBySlug,
);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: ArtistCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: ArtistUpdate }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
