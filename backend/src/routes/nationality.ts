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
import * as controller from "../controllers/nationality";
import { validate } from "../middleware/validate";

const router = Router();

const Nationality = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
  })
  .openapi("Nationality");

// The create body: a trimmed, non-empty name capped at 100 chars (matching the
// VARCHAR(100) column). Same schema doubles as the update body for this simple
// resource.
const NationalityCreate = z
  .object({
    name: z.string().trim().min(1).max(100).openapi({ example: "Turkish" }),
  })
  .openapi("NationalityCreate");

const NationalityList = paginated(Nationality, "NationalityList");

// List query: name lookup (?name=/?search=) plus pagination.
const NationalityListQuery = z.object({
  name: NameSearchQuery.shape.name,
  search: NameSearchQuery.shape.search,
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Nationalities";
const basePath = "/api/nationalities";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List nationalities",
  request: { query: NationalityListQuery },
  responses: { 200: jsonResponse("Paginated list", NationalityList) },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a nationality by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The nationality", Nationality),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a nationality",
  request: { body: jsonBody(NationalityCreate) },
  responses: {
    201: jsonResponse("Created", Nationality),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update a nationality",
  request: { params: IdParam, body: jsonBody(NationalityCreate) },
  responses: {
    200: jsonResponse("Updated", Nationality),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a nationality",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    400: jsonResponse("Foreign key constraint failed", ErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

// Routes run their validate() middleware first; on success the typed data is on
// req.valid and the controller handler runs. The list validates its name/search
// filters here; pagination is still parsed leniently in the controller.
router.get("/", validate({ query: NationalityListQuery }), controller.list);
router.get("/:id", validate({ params: IdParam }), controller.get); // // In fact, the routing methods can have more than one callback function as arguments. With multiple callback functions, it is important to provide next as an argument to the callback function and then call next() within the body of the function to hand off control to the next callback.
router.post("/", validate({ body: NationalityCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: NationalityCreate }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
