import { Request, Response } from "express";
import { PostManager } from "./manager";
import { AuthRequest } from "../auth/interface";

export class PostController {
    static getAllPosts = async (_req: Request, res: Response) => {
        res.json(await PostManager.getAllPosts());
    };

    static getPostById = async (req: Request, res: Response) => {
        res.json(await PostManager.getPostById(req.params.id));
    };

    static getPostsBySenderId = async (req: Request, res: Response) => {
        res.json(await PostManager.getPostsBySenderId(req.query?.senderId as string));
    };

    static createPost = async (req: AuthRequest, res: Response) => {
        const postData = {
            ...req.body,
            ...(req.file && { drinkImage: req.file.filename }),
        };
        res.status(201).json(await PostManager.createPost(postData, req.user._id));
    };

    static updatePost = async (req: AuthRequest, res: Response) => {
        const updateData = {
            ...req.body,
            ...(req.file && { drinkImage: req.file.filename }),
        };
        res.json(await PostManager.updatePostById(req.params.id, updateData, req.user._id));
    };

    static deletePostById = async (req: AuthRequest, res: Response) => {
        res.json(await PostManager.deletePostById(req.params.id, req.user._id));
    };
}
