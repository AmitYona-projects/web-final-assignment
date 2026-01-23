import { once } from "events";
import express from "express";
import helmet from "helmet";
import http from "http";
import { errorMiddleware } from "../utils/express/middlewares";
import { loggerMiddleware } from "../utils/logger/middleware";
import appRouter from "./router";
import { initializeSwagger } from "../utils/swagger";

export class Server {
    private app: express.Application;

    private http?: http.Server;

    constructor(private port: number) {
        this.app = Server.createExpressApp();
    }

    static createExpressApp() {
        const app = express();

        app.use(helmet());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

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
        this.http = this.app.listen(this.port);
        await once(this.http, "listening");
    }

    async stop() {
        if (this.http) {
            this.http.close();
            await once(this.http, "close");
        }
    }
}
