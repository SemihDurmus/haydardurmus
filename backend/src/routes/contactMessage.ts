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
import * as controller from "../controllers/contactMessage";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const PaintingProjection = z.object({
  id: z.number().int(),
  paintingNo: z.string(),
  paintingName: z.string(),
});

const ContactMessage = z
  .object({
    id: z.number().int(),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    email: z.string().email().max(255),
    message: z.string(),
    paintingId: z.number().int().nullable(),
    isRead: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    painting: PaintingProjection.nullable().optional(),
  })
  .openapi("ContactMessage");

// Public-facing form input: normalize the email (trim + lowercase) BEFORE
// validating and storing, so casing/whitespace variants collapse to one value.
const ContactMessageCreate = z
  .object({
    firstName: z.string().trim().min(1).max(100).openapi({ example: "Ayşe" }),
    lastName: z.string().trim().min(1).max(100).openapi({ example: "Kara" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .max(255)
      .openapi({ example: "ayse.kara@example.com" }),
    message: z
      .string()
      .trim()
      .min(1)
      .max(20000)
      .openapi({ example: "Eserin fiyatını öğrenebilir miyim?" }),
    paintingId: z.coerce.number().int().positive().optional().nullable(),
  })
  .openapi("ContactMessageCreate", {
    description: "Email is auto-lowercased before storage.",
  });

// Admin-side extras (isRead) join the partial public fields on PUT.
const ContactMessageUpdate = ContactMessageCreate.partial()
  .extend({ isRead: z.boolean().optional() })
  .openapi("ContactMessageUpdate");

// PUT is partial; reject an empty body so a no-op doesn't masquerade as success.
const ContactMessageUpdateRuntime = ContactMessageUpdate.refine(
  (d) => Object.keys(d).length > 0,
  { message: "Provide at least one field to update" },
);

const ContactMessageList = paginated(ContactMessage, "ContactMessageList");

const ContactMessageListQuery = z.object({
  paintingId: z.coerce.number().int().positive().optional(),
  // Tri-state: absent = all, "true" = read only, "false" = unread only.
  isRead: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: PaginationQuery.shape.page,
  limit: PaginationQuery.shape.limit,
});

const tag = "Contact Messages";
const basePath = "/api/contact-messages";

registry.registerPath({
  method: "get",
  path: basePath,
  tags: [tag],
  summary:
    "List contact messages (newest first; optionally filtered by paintingId)",
  request: { query: ContactMessageListQuery },
  responses: {
    200: jsonResponse(
      "Paginated list with painting projection",
      ContactMessageList,
    ),
  },
});

registry.registerPath({
  method: "get",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Get a contact message by id",
  request: { params: IdParam },
  responses: {
    200: jsonResponse("The message", ContactMessage),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "post",
  path: basePath,
  tags: [tag],
  summary: "Create a contact message",
  request: { body: jsonBody(ContactMessageCreate) },
  responses: {
    201: jsonResponse("Created", ContactMessage),
    400: jsonResponse(
      "Validation failed (incl. email format)",
      ValidationErrorResponse,
    ),
  },
});

registry.registerPath({
  method: "put",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Update a contact message (partial)",
  request: { params: IdParam, body: jsonBody(ContactMessageUpdate) },
  responses: {
    200: jsonResponse("Updated", ContactMessage),
    400: jsonResponse("Validation failed", ValidationErrorResponse),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

registry.registerPath({
  method: "delete",
  path: `${basePath}/{id}`,
  tags: [tag],
  summary: "Delete a contact message",
  request: { params: IdParam },
  responses: {
    204: emptyResponse("Deleted"),
    404: jsonResponse("Not found", ErrorResponse),
  },
});

// Reading messages is admin-only (they carry visitors' emails); only the POST
// below — the public contact form — is open. (The /api write guard lets that
// POST through; these GETs opt back into auth explicitly.)
router.get(
  "/",
  requireAuth,
  validate({ query: ContactMessageListQuery }),
  controller.list,
);
router.get("/:id", requireAuth, validate({ params: IdParam }), controller.get);
router.post("/", validate({ body: ContactMessageCreate }), controller.create);
router.put(
  "/:id",
  validate({ params: IdParam, body: ContactMessageUpdateRuntime }),
  controller.update,
);
router.delete("/:id", validate({ params: IdParam }), controller.remove);

export default router;
