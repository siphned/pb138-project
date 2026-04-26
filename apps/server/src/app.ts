import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { availabilityRoutes } from "./modules/availability";
import { cartsRoutes } from "./modules/carts";
import { eventsRoutes } from "./modules/events";
import { guestSessionsRoutes } from "./modules/guest-sessions";
import { ordersRoutes } from "./modules/orders";
import { productsRoutes } from "./modules/products";
import { roleRequestsRoutes } from "./modules/role-requests";
import { shopsRoutes } from "./modules/shops";
import { supplyAgreementsRoutes } from "./modules/supply-agreements";
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
          { name: "carts", description: "Shopping cart management for guests and users" },
          { name: "orders", description: "Order placement and history" },
          { name: "guest-sessions", description: "Anonymous session management" },
          { name: "supply-agreements", description: "B2B supply relationship management" },
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
  .use(cartsRoutes)
  .use(eventsRoutes)
  .use(ordersRoutes)
  .use(winesRoutes)
  .use(winemakersRoutes)
  .use(guestSessionsRoutes)
  .use(supplyAgreementsRoutes);
