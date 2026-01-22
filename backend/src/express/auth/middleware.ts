import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import config from "../../config";
import { AuthRequest } from "./interface";
import { verifyAccessToken } from "../../utils/auth";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith(config.auth.bearerPrefix)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication token is required" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);
        (req as AuthRequest).user = decoded;
        next();
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid authentication token", error: error });
    }
};
