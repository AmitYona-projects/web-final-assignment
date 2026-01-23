import * as expressWinston from "express-winston";
import { logger } from "./index";

export const loggerMiddleware = expressWinston.logger({
    transports: [logger],
    expressFormat: true,
    statusLevels: true,
});
