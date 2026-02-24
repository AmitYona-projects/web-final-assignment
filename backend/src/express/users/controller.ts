import { Request, Response } from "express";
import { UserManager } from "./manager";
import { AuthRequest } from "../auth/interface";
import { ServerError } from "../../utils/errors";
import { StatusCodes } from "http-status-codes";
export class UserController {
    static getAllUsers = async (_req: Request, res: Response) => {
        res.json(await UserManager.getAllUsers());
    };

    static getUserById = async (req: Request, res: Response) => {
        res.json(await UserManager.getUserById(req.params.id));
    };

    static createUser = async (req: Request, res: Response) => {
        res.status(201).json(await UserManager.createUser(req.body));
    };

    static updateUser = async (req: AuthRequest, res: Response) => {
        if (req.params.id !== req.user._id) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to update this user");
        }

        const updateData = {
            ...req.body,
            ...(req.file && { image: req.file.filename }),
        };
        res.json(await UserManager.updateUserById(req.params.id, updateData));
    };

    static deleteUserById = async (req: AuthRequest, res: Response) => {
        if (req.params.id !== req.user._id) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to delete this user");
        }

        res.json(await UserManager.deleteUserById(req.params.id));
    };

    static getMe = async (req: AuthRequest, res: Response) => {
        res.json(await UserManager.getUserById(req.user._id));
    };
}
