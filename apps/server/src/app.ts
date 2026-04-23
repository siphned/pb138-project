import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { availabilityRoutes } from "./modules/availability";
import { eventsRoutes } from "./modules/events";
import { productsRoutes } from "./modules/products";
import { roleRequestsRoutes } from "./modules/role-requests";
import { shopsRoutes } from "./modules/shops";
import { usersRoutes } from "./modules/users";
import { winemakersRoutes } from "./modules/winemakers";
import { winesRoutes } from "./modules/wines";

export const app = new Elysia()
  .use(cors({ origin: "http://localhost:5173" }))
  .use(
    openapi({
      provider: "scalar",
      specPath: "/swagger/json",
      documentation: {
        info: {
          title: "WineMarket API",
          version: "0.1.0",
          description: "Backend API for the WineMarket platform.",
        },
        tags: [
          { name: "users", description: "Authenticated user profile endpoints" },
          { name: "role-requests", description: "Winemaker/shop-owner role application flow" },
          { name: "shops", description: "Shop management" },
          { name: "products", description: "Products and bundles" },
          { name: "availability", description: "Shop availability schedule" },
          { name: "events", description: "Event management and registration" },
          { name: "wines", description: "Wine catalog CRUD and filtering" },
          { name: "winemakers", description: "Winemaker profiles and portfolios" },
        ],
        servers: [{ url: "http://localhost:3000", description: "Development" }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Clerk-issued JWT sent as `Authorization: Bearer <token>`",
            },
          },
        },
      },
    })
  )
  .use(usersRoutes)
  .use(roleRequestsRoutes)
  .use(shopsRoutes)
  .use(productsRoutes)
  .use(availabilityRoutes)
  .use(eventsRoutes)
  .use(winesRoutes)
  .use(winemakersRoutes);
