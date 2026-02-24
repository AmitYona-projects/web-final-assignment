import { Response, Request, NextFunction } from "express";
import { ServerError } from "../errors";
import { StatusCodes } from "http-status-codes";
import { logger } from "../logger";
import { AuthRequest } from "../../express/auth/interface";

export const wrapMiddleware = (func: (req: Request, res: Response) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res)
            .then(() => next())
            .catch(next);
    };
};

export const wrapValidator = wrapMiddleware;

export const wrapController = (func: (req: Request, res: Response, next?: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res, next).catch(next);
    };
};

export const wrapAuthMiddleware = (func: (req: AuthRequest, res: Response, next?: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req as AuthRequest, res, next).catch(next);
    };
};

export const errorMiddleware = (error: Error, _req: Request, res: Response, next: NextFunction) => {
    let serverError: ServerError;

    if (error instanceof ServerError) {
        serverError = error;
    } else if (["ValidationError", "SyntaxError"].includes(error.name)) {
        serverError = new ServerError(StatusCodes.BAD_REQUEST, error.message, error);
    } else {
        serverError = new ServerError(StatusCodes.INTERNAL_SERVER_ERROR, error.message, error);
    }

    res.status(serverError.code).json(serverError.responseJson);

    res.locals.error = serverError;

    logger.error(`Request failed with error: ${serverError.message}`);

    next();
};
