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
import * as controller from "../controllers/painting";
import { validate } from "../middleware/validate";
import {
  uploadPaintingImage,
  resolvePaintingFolder,
} from "../middleware/upload";
import { PAINTING_NO_PATTERN } from "../utils/paintingFiles";
import { PAINTING_SORT_KEYS } from "../services/painting";

const router = Router();

const ArtistRef = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  nationality: z.object({ id: z.number().int(), name: z.string() }).optional(),
});
const NamedRef = z.object({ id: z.number().int(), name: z.string() });
const CityWithCountry = z.object({
  id: z.number().int(),
  name: z.string(),
  country: NamedRef.optional(),
});
const OwnerRef = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
});
const PriceRef = z.object({
  id: z.number().int(),
  paintingId: z.number().int(),
  currencyId: z.number().int(),
  amount: z.string().openapi({ format: "decimal", example: "5000.00" }),
  effectiveDate: z.string().datetime(),
  isCurrent: z.boolean(),
  createdAt: z.string().datetime(),
  currency: z
    .object({
      id: z.number().int(),
      name: z.string(),
      symbol: z.string(),
    })
    .optional(),
});
const PaintingImageRef = z.object({
  id: z.number().int(),
  paintingId: z.number().int(),
  // The parent's physical number, denormalized onto each image row.
  paintingNo: z.string(),
  filePath: z.string(),
  isPrimary: z.boolean(),
  uploadedAt: z.string().datetime(),
});

const decimalString = z
  .string()
  .openapi({ format: "decimal", example: "117.00" });

const Painting = z
  .object({
    id: z.number().int(),
    // Decorative id+slug for pretty frontend URLs; the id stays authoritative.
    slug: z.string().openapi({ example: "1-kaplumbaga-terbiyecisi" }),
    paintingNo: z.string().max(50),
    paintingName: z.string().max(255),
    widthCm: decimalString.nullable(),
    heightCm: decimalString.nullable(),
    radiusCm: decimalString.nullable(),
    paintingDescription: z.string().nullable(),
    paintingDescriptionTr: z.string().nullable(),
    artistId: z.number().int(),
    year: z.number().int().nullable(),
    techniqueId: z.number().int().nullable(),
    materialId: z.number().int().nullable(),
    locationCityId: z.number().int().nullable(),
    ownerId: z.number().int().nullable(),
    isAvailable: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    artist: ArtistRef.optional(),
    technique: NamedRef.nullable().optional(),
    material: NamedRef.nullable().optional(),
    owner: OwnerRef.nullable().optional(),
    city: CityWithCountry.nullable().optional(),
    prices: z.array(PriceRef).optional(),
    paintingImages: z.array(PaintingImageRef).optional(),
  })
  .openapi("Painting");

// NUMERIC(7,2), strictly positive. z.coerce so a numeric string also passes.
const positiveDecimal = z.coerce
  .number()
  .positive()
  .max(99999.99)
  .openapi({ description: "NUMERIC(7,2), > 0" });

const xorDescription = `
**Dimensions rule (XOR):** Provide either (\`widthCm\` AND \`heightCm\`) for rectangular paintings,
OR \`radiusCm\` alone for circular ones. Mixed or partial dimensions return 400.
Enforced by both the API (zod refine) and the database (CHECK constraint).
`.trim();

// Doc twin: a flat object + prose XOR note. The XOR rule can't be expressed in
// JSON Schema, so the document describes it in prose while the RUNTIME twin below
// (with .refine()) actually enforces it. Both build from the same field shapes.
const PaintingCreate = z
  .object({
    // Restricted charset because painting_no names the folder its images are
    // stored in (public/paintings/<painting_no>/) — see utils/paintingFiles.ts.
    paintingNo: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .regex(PAINTING_NO_PATTERN)
      .openapi({ example: "X-001" }),
    paintingName: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .openapi({ example: "Kaplumbağa Terbiyecisi" }),
    widthCm: positiveDecimal.optional().nullable().openapi({ example: 117 }),
    heightCm: positiveDecimal.optional().nullable().openapi({ example: 222 }),
    radiusCm: positiveDecimal.optional().nullable(),
    paintingDescription: z.string().trim().max(20000).optional().nullable(),
  paintingDescriptionTr: z.string().trim().max(20000).optional().nullable(),
    artistId: z.coerce.number().int().positive().openapi({ example: 1 }),
    year: z.coerce
      .number()
      .int()
      .min(1000)
      .max(2100)
      .optional()
      .nullable()
      .openapi({ example: 1906 }),
    techniqueId: z.coerce.number().int().positive().optional().nullable(),
    materialId: z.coerce.number().int().positive().optional().nullable(),
    locationCityId: z.coerce.number().int().positive().optional().nullable(),
    ownerId: z.coerce.number().int().positive().optional().nullable(),
    isAvailable: z.boolean().optional().default(true),
  })
  .openapi("PaintingCreate", { description: xorDescription });

const PaintingUpdate = PaintingCreate.partial().openapi("PaintingUpdate", {
  description:
    "Partial update. If touching any of widthCm / heightCm / radiusCm the XOR rule still applies.",
});

const PaintingList = paginated(Painting, "PaintingList");

// Comma-separated ids ("3,7") -> number[]. A bare single id ("3") still works
// (splits to one element), so this is a non-breaking widening of what used to
// be single-value filters — lets the gallery's multi-select chips (technique,
// material, owner) be expressed server-side.
const csvIntList = (example: string) =>
  z
    .string()
    .optional()
    .openapi({ example, description: "Comma-separated ids" })
    .transform((v) =>
      v === undefined
        ? undefined
        : v
            .split(",")
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => Number.isInteger(n)),
    );

const PaintingListQuery = z.object({
  artistId: z.coerce.number().int().positive().optional(),
  ownerId: csvIntList("4,7"),
  techniqueId: csvIntList("1,2"),
  materialId: csvIntList("3"),
  // locationCityId = the painting's own (public) city, not the owner's city.
  locationCityId: z.coerce.number().int().positive().optional(),
  // Query params are strings; validate the literal then map to a real boolean.
  available: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  // Price range filters the current (listed) price.
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  // ?search= partial match on the painting's name (case-insensitive).
  search: NameSearchQuery.shape.search,
  year: csvIntList("1990,2005"),
  widthMin: z.coerce.number().min(0).optional(),
  widthMax: z.coerce.number().min(0).optional(),
  heightMin: z.coerce.number().min(0).optional(),
  heightMax: z.coerce.number().min(0).optional(),
  sort: z.enum(PAINTING_SORT_KEYS).optional().openapi({ example: "year_desc" }),
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

// Runtime twins: the same shapes, but with the XOR .refine() that validate()
// enforces on POST/PUT. (Kept separate from the doc twins above because a schema
// carrying a .refine() can't be rendered into clean JSON Schema.)
const baseShape = {
  paintingNo: z.string().trim().min(1).max(50).regex(PAINTING_NO_PATTERN),
  paintingName: z.string().trim().min(1).max(255),
  widthCm: positiveDecimal.optional().nullable(),
  heightCm: positiveDecimal.optional().nullable(),
  radiusCm: positiveDecimal.optional().nullable(),
  paintingDescription: z.string().trim().max(20000).optional().nullable(),
  paintingDescriptionTr: z.string().trim().max(20000).optional().nullable(),
  artistId: z.coerce.number().int().positive(),
  year: z.coerce.number().int().min(1000).max(2100).optional().nullable(),
  techniqueId: z.coerce.number().int().positive().optional().nullable(),
  materialId: z.coerce.number().int().positive().optional().nullable(),
  locationCityId: z.coerce.number().int().positive().optional().nullable(),
  ownerId: z.coerce.number().int().positive().optional().nullable(),
  isAvailable: z.boolean().optional().default(true),
};

const dimensionsXorMessage =
  "Provide either (widthCm AND heightCm) for rectangular OR (radiusCm) for circular — never mixed.";

// The XOR rule lives in a .refine() because it spans multiple fields — something
// a per-field schema can't express. (The DB CHECK constraint is the final guard.)
// Zod's .refine() method lets you add custom validation logic to a schema beyond built-in checks,
// such as ensuring a string ends with a specific domain or that a number meets a custom condition.
const PaintingCreateRuntime = z.object(baseShape).refine(
  // .refine() method can take two arguments: a validation function and an options object.
  ({ widthCm, heightCm, radiusCm }) /* Parameter Destructuring */ => {
    const hasRect = widthCm != null && heightCm != null && radiusCm == null;
    const hasCircle = radiusCm != null && widthCm == null && heightCm == null;
    return hasRect || hasCircle;
  },
  { message: dimensionsXorMessage, path: ["dimensions"] },
);

// On update every field is optional; only enforce XOR if a dimension was touched.
const PaintingUpdateRuntime = z
  .object(baseShape)
  .partial()
  .refine(
    ({ widthCm, heightCm, radiusCm }) => {
      const touched =
        widthCm !== undefined ||
        heightCm !== undefined ||
        radiusCm !== undefined;
      if (!touched) return true;
      const hasRect = widthCm != null && heightCm != null && radiusCm == null;
      const hasCircle = radiusCm != null && widthCm == null && heightCm == null;
      return hasRect || hasCircle;
    },
    { message: dimensionsXorMessage, path: ["dimensions"] },
  );

const tag = "Paintings";
const basePath = "/api/paintings";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary:
    "List paintings (filterable; includes artist, technique, material, owner, city, current price, primary image)",
  request: { query: PaintingListQuery },
  responses: {
    200: jsonResponse("Paginated list with full join graph", PaintingList),
  },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a painting by id (full join graph including price history)",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The painting", Painting),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/by-slug/{slug}`,
  tags: [tag],
  summary: "Get a painting by id+slug (pretty URL; only the leading id matters)",
  request: { params: SlugParam },
  responses: {
    200: jsonResponse("The painting", Painting),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a painting (rectangular OR circular)",
  description: xorDescription,
  request: { body: jsonBody(PaintingCreate) },
  responses: {
    201: jsonResponse("Created", Painting),
    400: jsonResponse(
      "Validation failed (incl. XOR dimensions)",
      ValidationErrorResponse,
    ),
    409: jsonResponse("paintingNo already exists", ErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update a painting (partial)",
  description: xorDescription,
  request: { params: IdParam, body: jsonBody(PaintingUpdate) },
  responses: {
    200: jsonResponse("Updated", Painting),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a painting",
  description:
    "Fails with 400 if the painting has any images or prices — delete those first.",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    400: jsonResponse("Has dependents (images, prices)", ErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: `${basePath}/{id}/images`,
  tags: [tag],
  summary: "Upload an image file for a painting (multipart/form-data)",
  security: [{ bearerAuth: [] }],
  request: {
    params: IdParam,
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            image: z.string().openapi({ type: "string", format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    201: jsonResponse("Image recorded", PaintingImageRef),
    400: jsonResponse("Missing or non-image file", ErrorResponse),
    404: jsonResponse("Painting not found", ErrorResponse),
  },
});

router.get("/", validate({ query: PaintingListQuery }), controller.list);
// by-slug must precede /:id so "/by-slug/..." isn't swallowed as an id.
router.get(
  "/by-slug/:slug",
  validate({ params: SlugParam }),
  controller.getBySlug,
);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: PaintingCreateRuntime }), controller.create);
// Multipart image upload: validate the :id, resolve the painting's number
// (404 if it doesn't exist — before any file is written), let multer write to
// public/paintings/<painting_no>/, then record it. (The /api write guard
// already requires an admin token for this POST.)
router.post(
  "/:id/images",
  validate({ params: IdParam }),
  resolvePaintingFolder,
  uploadPaintingImage,
  controller.uploadImage,
);
router.put(
  "/:id",
  validate({ params: IdParam, body: PaintingUpdateRuntime }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
