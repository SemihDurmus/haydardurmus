import { z } from "zod";
import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

// Monkey-patches a `.openapi()` method onto every zod schema. This MUST run
// before any route module calls `.openapi()`, which is why every route imports
// `z` from here (not from "zod") — importing this file is what applies the patch.
extendZodWithOpenApi(z);

// One shared registry. Each route module registers its schemas + path operations
// onto this instance at import time; spec.ts then reads it to build the document.
export const registry = new OpenAPIRegistry();

export { z };
