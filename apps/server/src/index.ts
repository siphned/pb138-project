import { app } from "./app";

// biome-ignore lint/suspicious/noConsole: entry point
console.log("Starting server at http://localhost:3000");
// biome-ignore lint/suspicious/noConsole: entry point
console.log("OpenAPI spec available at http://localhost:3000/swagger/json");
app.listen(3000);
