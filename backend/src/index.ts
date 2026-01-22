import config from "./config/index";
import { Server } from "./express/server";
import { logger } from "./utils/logger/index";
import { initializeMongo } from "./utils/mongo";

const main = async () => {
    await initializeMongo();

    const server = new Server(config.server.port);

    await server.start();

    logger.info(`Server started on port: ${config.server.port}`);
};

main().catch(logger.error);
