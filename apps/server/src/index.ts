import { app } from "./app";
import { logger } from "./utils/logger";

const port = process.env.PORT || 3000;
logger.info(`Starting server at http://localhost:${port}`);
logger.info(`OpenAPI spec available at http://localhost:${port}/swagger/json`);
app.listen(port);
