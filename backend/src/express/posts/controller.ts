import { Request, Response } from "express";
import { PostManager } from "./manager";
import { AuthRequest } from "../auth/interface";
import { PostSearchParams } from "./interface";

const parseSearchParams = (query: Request["query"]): PostSearchParams => ({
    skip: parseInt(query.skip as string) || 0,
    limit: parseInt(query.limit as string) || 10,
    search: (query.search as string) || undefined,
    categories: query.categories
        ? ((Array.isArray(query.categories)
            ? (query.categories as string[])
            : [query.categories as string]) as PostSearchParams["categories"])
        : undefined,
    sort: (query.sort as string) || undefined,
    hasLikes: query.hasLikes === "true",
    hasComments: query.hasComments === "true",
    aiPrompt: (query.aiPrompt as string) || undefined,
});

export class PostController {
    static getAllPosts = async (req: Request, res: Response) => {
        res.json(await PostManager.getAllPosts(parseSearchParams(req.query)));
    };

    static getPostById = async (req: Request, res: Response) => {
        res.json(await PostManager.getPostById(req.params.id));
    };

    static getPostsBySenderId = async (req: Request, res: Response) => {
        const params = parseSearchParams(req.query);
        res.json(await PostManager.getPostsBySenderId(req.query.senderId as string, params));
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

    static toggleLike = async (req: AuthRequest, res: Response) => {
        res.json(await PostManager.toggleLike(req.params.id, req.user._id));
    };

    static addComment = async (req: AuthRequest, res: Response) => {
        res.status(201).json(await PostManager.addComment(req.params.id, req.user._id, req.body.commentText));
    };

    static deleteComment = async (req: AuthRequest, res: Response) => {
        res.json(await PostManager.deleteComment(req.params.id, req.params.commentId, req.user._id));
    };
}
