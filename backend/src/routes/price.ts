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
import * as controller from "../controllers/price";
import { validate } from "../middleware/validate";

const router = Router();

const CurrencyRef = z.object({
  id: z.number().int(),
  name: z.string(),
  symbol: z.string(),
});

const Price = z
  .object({
    id: z.number().int(),
    paintingId: z.number().int(),
    currencyId: z.number().int(),
    amount: z.string().openapi({ format: "decimal", example: "5000.00" }),
    effectiveDate: z.string().datetime(),
    isCurrent: z.boolean(),
    createdAt: z.string().datetime(),
    currency: CurrencyRef.optional(),
  })
  .openapi("Price");

// effectiveDate is a @db.Date column. Prisma 7's driver adapter rejects a bare
// "YYYY-MM-DD" string ("Expected ISO-8601 DateTime"), so we keep the public
// contract date-only but transform to a full UTC midnight Date for Prisma.
// (The explicit .openapi({type,format}) gives zod-to-openapi the doc shape it
// can't infer through the transform.)
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "effectiveDate must be YYYY-MM-DD")
  .openapi({ type: "string", format: "date", example: "2026-05-26" })
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

const PriceCreate = z
  .object({
    paintingId: z.coerce.number().int().positive().openapi({ example: 1 }),
    currencyId: z.coerce.number().int().positive().openapi({ example: 1 }),
    amount: z.coerce
      .number()
      .min(0)
      .max(999999999999.99)
      .openapi({ example: 5000 }),
    effectiveDate: isoDate.optional(),
  })
  .openapi("PriceCreate", {
    description:
      "POSTing a new price atomically sets `isCurrent=false` on the painting's previous current price.",
  });

const PriceUpdate = z
  .object({
    amount: z.coerce.number().min(0).max(999999999999.99).optional(),
    effectiveDate: isoDate.optional(),
  })
  .openapi("PriceUpdate", {
    description:
      "Only `amount` and `effectiveDate` can be updated. To replace a price, POST a new one.",
  });

// PUT is partial, but an empty body is a no-op — reject it with a clear 400.
const PriceUpdateRuntime = PriceUpdate.refine(
  (d) => Object.keys(d).length > 0,
  { message: "Provide at least one of amount, effectiveDate" },
);

const PriceList = paginated(Price, "PriceList");

const PriceListQuery = z.object({
  paintingId: z.coerce.number().int().positive().optional(),
  // Query params are strings; only "true" enables the current-only filter.
  currentOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Prices";
const basePath = "/api/prices";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary: "List prices (history; filter by paintingId or currentOnly=true)",
  request: { query: PriceListQuery },
  responses: { 200: jsonResponse("Paginated list with currency", PriceList) },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a price by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The price", Price),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a new current price for a painting",
  description:
    "Transactional: any prior `isCurrent=true` price for the same painting is set to `isCurrent=false` before this row is inserted.",
  request: { body: jsonBody(PriceCreate) },
  responses: {
    201: jsonResponse("Created (the new current price)", Price),
    400: jsonResponse("Validation failed or bad FK", ValidationErrorResponse),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update amount / effectiveDate of an existing price",
  request: { params: IdParam, body: jsonBody(PriceUpdate) },
  responses: {
    200: jsonResponse("Updated", Price),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a price",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

router.get("/", validate({ query: PriceListQuery }), controller.list);
router.get("/:id", validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: PriceCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: PriceUpdateRuntime }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
