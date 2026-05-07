import { app } from "./app";
import { logger } from "./utils/logger";

logger.info("Starting server at http://localhost:3000");
logger.info("OpenAPI spec available at http://localhost:3000/swagger/json");
app.listen(3000);
