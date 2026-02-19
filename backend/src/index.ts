import config from "./config/index";
import { Server } from "./express/server";
import { logger } from "./utils/logger/index";
import { initializeMongo } from "./utils/mongo";

const main = async () => {
    await initializeMongo();

    const port = config.nodeEnv === "production" ? config.server.httpsPort : config.server.port;
    const server = new Server(port);

    await server.start();
};

main().catch(logger.error);
