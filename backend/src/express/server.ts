import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import config from "../config";
import { errorMiddleware } from "../utils/express/middlewares";
import { loggerMiddleware } from "../utils/logger/middleware";
import { logger } from "../utils/logger";
import appRouter from "./router";
import { initializeSwagger } from "../utils/swagger";

export class Server {
    private app: express.Application;

    private server?: http.Server | https.Server;

    constructor(private port: number) {
        this.app = Server.createExpressApp();
    }

    static createExpressApp() {
        const app = express();

        app.use(
            helmet({
                crossOriginResourcePolicy: { policy: "cross-origin" },
            })
        );
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors());

        app.use("/uploads", express.static(path.resolve(__dirname, "../..", "public/uploads")));

        app.use(loggerMiddleware);
        app.use(appRouter);

        initializeSwagger(app);

        app.use(errorMiddleware);

        return app;
    }

    get expressApp() {
        return this.app;
    }

    async start() {
        try {
            if (config.nodeEnv !== "production") {
                logger.info("development mode");
                this.server = http.createServer(this.app);
                this.server.listen(this.port, () => {
                    logger.info(`server listening on port ${this.port}`);
                });
            } else {
                logger.info("production mode");
                const options = {
                    key: fs.readFileSync(path.join(__dirname, "../../cert/client-key.pem")),
                    cert: fs.readFileSync(path.join(__dirname, "../../cert/client-cert.pem")),
                };
                this.server = https.createServer(options, this.app);
                this.server.listen(this.port, () => {
                    logger.info(`server listening on port ${this.port}`);
                });
            }
        } catch (error) {
            logger.error(`Error starting server: ${error}`);
            throw error;
        }
    }

    async stop() {
        if (this.server) {
            this.server.close();
        }
    }
}
