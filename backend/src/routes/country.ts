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
import * as controller from "../controllers/country";
import { validate } from "../middleware/validate";

const router = Router();

const Country = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
    _count: z
      .object({ cities: z.number().int() })
      .optional()
      .openapi({ description: "Present on list responses" }),
    cities: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string(),
          countryId: z.number().int(),
        }),
      )
      .optional()
      .openapi({ description: "Present on get-by-id responses" }),
  })
  .openapi("Country");

const CountryCreate = z
  .object({
    name: z.string().trim().min(1).max(100).openapi({ example: "Türkiye" }),
  })
  .openapi("CountryCreate");

const CountryList = paginated(Country, "CountryList");

// List query: name lookup (?name=/?search=) plus pagination.
const CountryListQuery = z.object({
  name: NameSearchQuery.shape.name,
  search: NameSearchQuery.shape.search,
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Countries";
const basePath = "/api/countries";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List countries (with city counts)",
  request: { query: CountryListQuery },
  responses: { 200: jsonResponse("Paginated list", CountryList) },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a country by id (with nested cities)",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The country with cities", Country),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a country",
  request: { body: jsonBody(CountryCreate) },
  responses: {
    201: jsonResponse("Created", Country),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update a country",
  request: { params: IdParam, body: jsonBody(CountryCreate) },
  responses: {
    200: jsonResponse("Updated", Country),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a country",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    400: jsonResponse("Foreign key constraint failed", ErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

router.get("/", validate({ query: CountryListQuery }), controller.list);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: CountryCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: CountryCreate }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
