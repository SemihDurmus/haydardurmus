import type { ZodTypeAny } from "zod";
import { z, registry } from "./registry";

// IdParam: route params arrive as strings, so coerce to a number and require a
// positive integer. Reused by every /:id route. (This is the shared openapi/common.ts
// home the earlier phases pointed to; until Phase 15 it lived in routes/nationality.ts.)
export const IdParam = z
  .object({
    id: z.coerce.number().int().positive().openapi({
      param: { name: "id", in: "path" },
      example: 1,
    }),
  })
  .openapi("IdParam");

// Path param for the id+slug hybrid lookup (GET /<resource>/by-slug/:slug). The
// slug's leading id is the only authoritative part; the text after it is cosmetic.
export const SlugParam = z
  .object({
    slug: z.string().min(1).openapi({
      param: { name: "slug", in: "path" },
      example: "12-kaplumbaga-terbiyecisi",
    }),
  })
  .openapi("SlugParam");

export const PaginationQuery = z.object({
  page: z.coerce.number().int().positive().optional().openapi({ example: 1 }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .openapi({ example: 20 }),
});

// Shared name-lookup query params for list endpoints (Improvements backlog #1):
// ?name= exact (case-insensitive), ?search= partial (contains). Each route picks
// these via `.shape` so the description/validation is defined once, used everywhere.
export const NameSearchQuery = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .optional()
    .openapi({ description: "Exact name match (case-insensitive)" }),
  search: z
    .string()
    .trim()
    .min(1)
    .optional()
    .openapi({ description: "Partial name match (contains, case-insensitive)" }),
});

export const PaginationMeta = z
  .object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
  .openapi("PaginationMeta");

registry.register("PaginationMeta", PaginationMeta);

export const ErrorResponse = z
  .object({
    error: z.string(),
  })
  .openapi("ErrorResponse");

registry.register("ErrorResponse", ErrorResponse);

const ValidationIssue = z.object({
  code: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
});

export const ValidationErrorResponse = z
  .object({
    error: z.literal("Validation failed"),
    issues: z.array(ValidationIssue),
  })
  .openapi("ValidationErrorResponse");

registry.register("ValidationErrorResponse", ValidationErrorResponse);

// Wraps any item schema in the standard { data: [...], pagination } envelope and
// registers it under `name`, so list responses get a named component in the spec.
export function paginated<T extends ZodTypeAny>(itemSchema: T, name: string) {
  return z
    .object({
      data: z.array(itemSchema),
      pagination: PaginationMeta,
    })
    .openapi(name);
}

export const jsonBody = (schema: ZodTypeAny) => ({
  content: { "application/json": { schema } },
});

export const jsonResponse = (description: string, schema: ZodTypeAny) => ({
  description,
  content: { "application/json": { schema } },
});

export const emptyResponse = (description: string) => ({ description });
