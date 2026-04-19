import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";

new Elysia()
  .use(cors({ origin: "http://localhost:5173" }))
  .use(
    openapi({
      path: "/swagger",
      documentation: {
        info: {
          title: "WineMarket API",
          version: "1.0.0",
          description: "Multi-vendor wine marketplace API",
        },
      },
    })
  )
  .get("/", () => "Hello from API")
  .listen(3000);

console.log("Server running on http://localhost:3000");
console.log("OpenAPI spec available at http://localhost:3000/swagger/json");
