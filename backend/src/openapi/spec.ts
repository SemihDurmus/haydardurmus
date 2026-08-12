import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

// Side-effect imports: each module registers its schemas + path operations with
// the shared registry at import time. Importing them all here is what populates
// the registry before we generate the document. (common first: shared schemas.)
import "./common";
import "../routes/auth";
import "../routes/nationality";
import "../routes/technique";
import "../routes/material";
import "../routes/currency";
import "../routes/country";
import "../routes/city";
import "../routes/artist";
import "../routes/owner";
import "../routes/painting";
import "../routes/paintingImage";
import "../routes/price";
import "../routes/contactMessage";

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openapiDocument = generator.generateDocument({
  openapi: "3.1.0",
  info: {
    title: "Art Gallery API",
    version: "0.1.0",
    description:
      "REST API for the Art Gallery database (TypeScript build). Twelve resources with full CRUD, pagination, filtering, and validation. Use the **Try it out** button on any endpoint to send a live request against this server.",
  },
  servers: [{ url: "http://localhost:3000", description: "Local dev server" }],
});

export default openapiDocument;
