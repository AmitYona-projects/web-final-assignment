import { StatusCodes } from "http-status-codes";
import { DocumentNotFoundError, ServerError } from "../../utils/errors";
import { IComment, IMongoPost, IPost } from "./interface";
import { PostModel } from "./model";

export class PostManager {
    static getAllPosts = async (): Promise<IMongoPost[]> => {
        return PostModel.find().lean().exec();
    };

    static getPostById = async (id: string): Promise<IMongoPost> => {
        return PostModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    };

    static getPostsBySenderId = async (senderId: string): Promise<IMongoPost[]> => {
        return PostModel.find({ owner: senderId }).lean().exec();
    };

    static createPost = async (post: IPost, senderId: string): Promise<IMongoPost> => {
        return PostModel.create({ ...post, owner: senderId });
    };

    static updatePostById = async (id: string, update: Partial<IPost>, senderId: string): Promise<IMongoPost> => {
        const post = await PostModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        if (post.owner.toString() !== senderId) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to update this post");
        }

        return PostModel.findByIdAndUpdate(id, update, { new: true })
            .orFail(new DocumentNotFoundError(id))
            .lean()
            .exec();
    };

    static deletePostById = async (id: string, senderId: string): Promise<string> => {
        const post = await PostModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        if (post.owner.toString() !== senderId) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to delete this post");
        }

        await PostModel.findByIdAndDelete(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        return `Post ${id} deleted succesfully`;
    };

    static toggleLike = async (postId: string, userId: string): Promise<IMongoPost> => {
        const post = await PostModel.findById(postId).orFail(new DocumentNotFoundError(postId));

        const hasLiked = post.likes.some((id) => id.toString() === userId);

        if (hasLiked) {
            return PostModel.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true })
                .orFail(new DocumentNotFoundError(postId))
                .lean()
                .exec();
        } else {
            return PostModel.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true })
                .orFail(new DocumentNotFoundError(postId))
                .lean()
                .exec();
        }
    };

    static addComment = async (postId: string, senderId: string, commentText: string): Promise<IMongoPost> => {
        return PostModel.findByIdAndUpdate(postId, { $push: { comments: { senderId, commentText } } }, { new: true })
            .orFail(new DocumentNotFoundError(postId))
            .lean()
            .exec();
    };

    static deleteComment = async (postId: string, commentId: string, userId: string): Promise<IMongoPost> => {
        const post = await PostModel.findById(postId).orFail(new DocumentNotFoundError(postId)).lean().exec();

        const comment = post.comments.find((c: IComment) => c._id?.toString() === commentId);
        if (!comment) {
            throw new ServerError(StatusCodes.NOT_FOUND, "Comment not found");
        }

        if (comment.senderId.toString() !== userId && post.owner.toString() !== userId) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to delete this comment");
        }

        return PostModel.findByIdAndUpdate(postId, { $pull: { comments: { _id: commentId } } }, { new: true })
            .orFail(new DocumentNotFoundError(postId))
            .lean()
            .exec();
    };
}
