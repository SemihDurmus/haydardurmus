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
import * as controller from "../controllers/technique";
import { validate } from "../middleware/validate";

const router = Router();

const Technique = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
  })
  .openapi("Technique");

const TechniqueCreate = z
  .object({
    name: z.string().trim().min(1).max(100).openapi({ example: "Yağlı Boya" }),
  })
  .openapi("TechniqueCreate");

const TechniqueList = paginated(Technique, "TechniqueList");

// List query: name lookup (?name=/?search=) plus pagination.
const TechniqueListQuery = z.object({
  name: NameSearchQuery.shape.name,
  search: NameSearchQuery.shape.search,
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Techniques";
const basePath = "/api/techniques";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List techniques",
  request: { query: TechniqueListQuery },
  responses: { 200: jsonResponse("Paginated list", TechniqueList) },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a technique by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The technique", Technique),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a technique",
  request: { body: jsonBody(TechniqueCreate) },
  responses: {
    201: jsonResponse("Created", Technique),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update a technique",
  request: { params: IdParam, body: jsonBody(TechniqueCreate) },
  responses: {
    200: jsonResponse("Updated", Technique),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a technique",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    400: jsonResponse("Foreign key constraint failed", ErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

router.get("/", validate({ query: TechniqueListQuery }), controller.list);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: TechniqueCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: TechniqueCreate }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
