import { Router } from "express";
import { z, registry } from "../openapi/registry";
import {
  IdParam,
  PaginationQuery,
  NameSearchQuery,
  ErrorResponse,
  ValidationErrorResponse,
  paginated,
  jsonBody,
  jsonResponse,
  emptyResponse,
} from "../openapi/common";
import * as controller from "../controllers/owner";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const NationalityRef = z.object({ id: z.number().int(), name: z.string() });
const CountryRef = z.object({ id: z.number().int(), name: z.string() });
const CityWithCountry = z.object({
  id: z.number().int(),
  name: z.string(),
  countryId: z.number().int(),
  country: CountryRef.optional(),
});

const Owner = z
  .object({
    id: z.number().int(),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    cityId: z.number().int().nullable(),
    nationalityId: z.number().int().nullable(),
    description: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    city: CityWithCountry.nullable().optional(),
    nationality: NationalityRef.nullable().optional(),
    _count: z.object({ paintings: z.number().int() }).optional(),
  })
  .openapi("Owner");

// Both FKs are optional + nullable: an owner can be an anonymous patron with no
// city and no nationality. (Contrast artist, whose nationalityId is required.)
const OwnerCreate = z
  .object({
    firstName: z.string().trim().min(1).max(100).openapi({ example: "Ahmet" }),
    lastName: z.string().trim().min(1).max(100).openapi({ example: "Yılmaz" }),
    cityId: z.coerce.number().int().positive().optional().nullable(),
    nationalityId: z.coerce.number().int().positive().optional().nullable(),
    description: z.string().trim().max(10000).optional().nullable(),
  })
  .openapi("OwnerCreate");

const OwnerUpdate = OwnerCreate.partial().openapi("OwnerUpdate");

const OwnerList = paginated(Owner, "OwnerList");

const OwnerListQuery = z.object({
  cityId: z.coerce.number().int().positive().optional(),
  nationalityId: z.coerce.number().int().positive().optional(),
  // ?search= matches first OR last name (case-insensitive). Admin-only convenience.
  search: NameSearchQuery.shape.search,
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Owners";
const basePath = "/api/owners";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List owners (admin only)",
  security: [{ bearerAuth: [] }],
  request: { query: OwnerListQuery },
  responses: {
    200: jsonResponse("Paginated list", OwnerList),
    401: jsonResponse("Missing or invalid token", ErrorResponse),
  },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get an owner by id (admin only)",
  security: [{ bearerAuth: [] }],
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The owner", Owner),
    401: jsonResponse("Missing or invalid token", ErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create an owner",
  description:
    "cityId and nationalityId are optional/nullable (anonymous patrons OK).",
  request: { body: jsonBody(OwnerCreate) },
  responses: {
    201: jsonResponse("Created", Owner),
    400: jsonResponse("Validation failed or bad FK", ValidationErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update an owner (partial)",
  request: { params: IdParam, body: jsonBody(OwnerUpdate) },
  responses: {
    200: jsonResponse("Updated", Owner),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete an owner",
  request: { params: IdParam },
  responses: {
    204: emptyResponse(
      "Deleted (paintings keep existing, their ownerId becomes null)",
    ),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

// Owners are private data — real people's names, cities and nationalities,
// linked to the artworks they own. Nothing on the public site displays them;
// only the admin panel (painting form + library) reads this resource, and it
// sends a bearer token. So unlike the other lookups, the GETs are gated too.
// (Writes are already covered by the central guard in app.ts.)
router.get(
  "/",
  requireAuth,
  validate({ query: OwnerListQuery }),
  controller.list,
);
router.get("/:id", requireAuth, validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: OwnerCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: OwnerUpdate }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
