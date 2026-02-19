import { Request, Response } from "express";
import { AuthManager } from "./manager";
import { AuthRequest } from "./interface";

export class AuthController {
    static login = async (req: Request, res: Response) => {
        const result = await AuthManager.login(req.body);

        res.json(result);
    };

    static register = async (req: Request, res: Response) => {
        const registerData = {
            ...req.body,
            ...(req.file && { image: req.file.filename }),
        };
        const result = await AuthManager.register(registerData);

        res.status(201).json(result);
    };

    static logout = async (req: AuthRequest, res: Response) => {
        const { refreshToken } = req.body;
        const result = await AuthManager.logout(refreshToken, req.user);

        res.json(result);
    };

    static refreshToken = async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const result = await AuthManager.refreshToken(refreshToken);

        res.json(result);
    };

    static loginGoogle = async (req: Request, res: Response) => {
        const result = await AuthManager.loginGoogle(req);

        res.json(result);
    };
}
