import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { zodToJsonSchema } from "zod-to-json-schema";
import { adminRoutes } from "./modules/admin";
import { availabilityRoutes } from "./modules/availability";
import { cartsRoutes } from "./modules/carts";
import { eventsRoutes } from "./modules/events";
import { guestSessionsRoutes } from "./modules/guest-sessions";
import { imagesRoutes } from "./modules/images";
import { ordersRoutes } from "./modules/orders";
import { productsRoutes, shopProductsRoutes } from "./modules/products";
import { reviewsRoutes } from "./modules/reviews";
import { roleRequestsRoutes } from "./modules/role-requests";
import { shopsRoutes } from "./modules/shops";
import { statsRoutes } from "./modules/stats";
import { supplyAgreementsRoutes } from "./modules/supply-agreements";
import { usersRoutes } from "./modules/users";
import { webhooksRoutes } from "./modules/webhooks";
import { winemakersRoutes } from "./modules/winemakers";
import { winesRoutes } from "./modules/wines";
import { errorPlugin } from "./utils/error-plugin";

const isProd = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const apiUrl = process.env.API_URL || "http://localhost:3000";

export const app = new Elysia()
  .use(errorPlugin)
  .use(cors({ origin: frontendUrl }))
  .use(
    openapi({
      mapJsonSchema: {
        // biome-ignore lint/suspicious/noExplicitAny: mapper bridges Zod -> JSON Schema
        zod: (schema: any) =>
          // $refStrategy: "none" inlines repeated sub-schemas instead of emitting
          // internal $ref pointers, which break once Elysia inlines each operation
          // (the refs would point at a non-existent document root and Kubb fails).
          zodToJsonSchema(schema, { $refStrategy: "none", target: "openApi3" }),
      },
      documentation: {
        components: {
          securitySchemes: {
            bearerAuth: {
              bearerFormat: "JWT",
              description: "Clerk-issued JWT sent as `Authorization: Bearer <token>`",
              scheme: "bearer",
              type: "http",
            },
          },
        },
        info: {
          description: "Backend API for the WineMarket platform.",
          title: "WineMarket API",
          version: "0.1.0",
        },
        servers: [{ description: isProd ? "Production" : "Development", url: apiUrl }],
        tags: [
          { description: "Authenticated user profile endpoints", name: "users" },
          { description: "Winemaker/shop-owner role application flow", name: "role-requests" },
          { description: "Shop management", name: "shops" },
          { description: "Products and bundles", name: "products" },
          { description: "Shop availability schedule", name: "availability" },
          { description: "Event management and registration", name: "events" },
          { description: "Wine catalog CRUD and filtering", name: "wines" },
          { description: "Winemaker profiles and portfolios", name: "winemakers" },
          { description: "Shopping cart management for guests and users", name: "carts" },
          { description: "Order placement and history", name: "orders" },
          { description: "Product and winemaker reviews and ratings", name: "reviews" },
          { description: "Role-scoped aggregate statistics", name: "stats" },
          { description: "Platform administration and moderation", name: "admin" },
          { description: "Anonymous session management", name: "guest-sessions" },
          { description: "B2B supply relationship management", name: "supply-agreements" },
          { description: "Image upload and management", name: "images" },
        ],
      },
      provider: "scalar",
      specPath: "/swagger/json",
    })
  )
  .use(usersRoutes)
  .use(webhooksRoutes)
  .use(roleRequestsRoutes)
  .use(shopsRoutes)
  .use(productsRoutes)
  .use(shopProductsRoutes)
  .use(availabilityRoutes)
  .use(cartsRoutes)
  .use(eventsRoutes)
  .use(ordersRoutes)
  .use(winesRoutes)
  .use(winemakersRoutes)
  .use(guestSessionsRoutes)
  .use(supplyAgreementsRoutes)
  .use(reviewsRoutes)
  .use(statsRoutes)
  .use(adminRoutes)
  .use(imagesRoutes);
