import { Request, Response } from "express";
import { CommentManager } from "./manager";
import { AuthRequest } from "../auth/interface";

export class CommentController {
    static getAllComments = async (_req: Request, res: Response) => {
        res.json(await CommentManager.getAllComments());
    };

    static getCommentById = async (req: Request, res: Response) => {
        res.json(await CommentManager.getCommentById(req.params.id));
    };

    static getCommentsByPostId = async (req: Request, res: Response) => {
        res.json(await CommentManager.getCommentsByPostId(req.params.postId as string));
    };

    static createComment = async (req: AuthRequest, res: Response) => {
        res.status(201).json(await CommentManager.createComment(req.body, req.user._id));
    };

    static updateCommentById = async (req: AuthRequest, res: Response) => {
        res.json(await CommentManager.updateCommentById(req.params.id, req.body, req.user._id));
    };

    static deleteCommentById = async (req: AuthRequest, res: Response) => {
        res.json(await CommentManager.deleteCommentById(req.params.id, req.user._id));
    };
}
