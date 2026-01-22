import { StatusCodes } from "http-status-codes";
import { DocumentNotFoundError, ServerError } from "../../utils/errors";
import { IMongoPost, IPost } from "./interface";
import { PostModel } from "./model";

export class PostManager {
    static getAllPosts = async (): Promise<IMongoPost[]> => {
        return PostModel.find().lean().exec();
    };

    static getPostById = async (id: string): Promise<IMongoPost> => {
        return PostModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    };

    static getPostsBySenderId = async (senderId: string): Promise<IMongoPost[]> => {
        return PostModel.find({ senderId: senderId }).orFail(new DocumentNotFoundError(senderId)).lean().exec();
    };

    static createPost = async (post: IPost, senderId: string): Promise<IMongoPost> => {
        return PostModel.create({ ...post, senderId });
    };

    static updatePostById = async (id: string, update: Partial<IPost>, senderId: string): Promise<IMongoPost> => {
        const post = await PostModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        if (post.senderId.toString() !== senderId) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to update this post");
        }

        return PostModel.findByIdAndUpdate(id, update, { new: true })
            .orFail(new DocumentNotFoundError(id))
            .lean()
            .exec();
    };

    static deletePostById = async (id: string, senderId: string): Promise<string> => {
        const post = await PostModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        if (post.senderId.toString() !== senderId) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to delete this post");
        }

        await PostModel.findByIdAndDelete(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        return `Post ${id} deleted succesfully`;
    };
}
