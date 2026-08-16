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
import * as controller from "../controllers/city";
import { validate } from "../middleware/validate";

const router = Router();

const CountryRef = z.object({ id: z.number().int(), name: z.string() });

const City = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    nameTr: z.string().max(100),
    countryId: z.number().int(),
    country: CountryRef.optional(),
  })
  .openapi("City");

// Body carries the FK directly. z.coerce turns the JSON number through unchanged
// but also tolerates a numeric string, mirroring how params/query coerce.
const CityCreate = z
  .object({
    name: z.string().trim().min(1).max(100).openapi({ example: "Istanbul" }),
    nameTr: z.string().trim().min(1).max(100).openapi({ example: "İstanbul" }),
    countryId: z.coerce.number().int().positive().openapi({ example: 1 }),
  })
  .openapi("CityCreate");

const CityList = paginated(City, "CityList");

// First schema that validates the QUERY part. countryId is the optional filter;
// page/limit are validated here too, though pagination still reads raw query.
const CityListQuery = z.object({
  countryId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .openapi({ description: "Filter cities by country id" }),
  // Name lookup. NB city names repeat across countries — pair with countryId.
  name: NameSearchQuery.shape.name,
  search: NameSearchQuery.shape.search,
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Cities";
const basePath = "/api/cities";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List cities (optionally filtered by countryId)",
  request: { query: CityListQuery },
  responses: { 200: jsonResponse("Paginated list with country", CityList) },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a city by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The city with country", City),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a city",
  description: "Composite uniqueness on (name, countryId).",
  request: { body: jsonBody(CityCreate) },
  responses: {
    201: jsonResponse("Created", City),
    400: jsonResponse("Validation failed or bad FK", ValidationErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update a city",
  request: { params: IdParam, body: jsonBody(CityCreate) },
  responses: {
    200: jsonResponse("Updated", City),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a city",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    400: jsonResponse("Foreign key constraint failed", ErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

router.get("/", validate({ query: CityListQuery }), controller.list);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: CityCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: CityCreate }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
