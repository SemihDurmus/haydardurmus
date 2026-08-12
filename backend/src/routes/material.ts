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
import * as controller from "../controllers/material";
import { validate } from "../middleware/validate";

const router = Router();

const Material = z
  .object({
    id: z.number().int(),
    name: z.string().max(100),
  })
  .openapi("Material");

const MaterialCreate = z
  .object({
    name: z.string().trim().min(1).max(100).openapi({ example: "Tuval" }),
  })
  .openapi("MaterialCreate");

const MaterialList = paginated(Material, "MaterialList");

// List query: name lookup (?name=/?search=) plus pagination.
const MaterialListQuery = z.object({
  name: NameSearchQuery.shape.name,
  search: NameSearchQuery.shape.search,
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Materials";
const basePath = "/api/materials";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List materials",
  request: { query: MaterialListQuery },
  responses: { 200: jsonResponse("Paginated list", MaterialList) },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a material by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The material", Material),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a material",
  request: { body: jsonBody(MaterialCreate) },
  responses: {
    201: jsonResponse("Created", Material),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update a material",
  request: { params: IdParam, body: jsonBody(MaterialCreate) },
  responses: {
    200: jsonResponse("Updated", Material),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
    409: jsonResponse("Unique constraint violation", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a material",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    400: jsonResponse("Foreign key constraint failed", ErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

router.get("/", validate({ query: MaterialListQuery }), controller.list);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: MaterialCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: MaterialCreate }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
