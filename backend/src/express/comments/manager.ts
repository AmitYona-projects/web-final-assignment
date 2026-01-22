import { StatusCodes } from "http-status-codes";
import { DocumentNotFoundError, ServerError } from "../../utils/errors";
import { IMongoComment, IComment } from "./interface";
import { CommentModel } from "./model";

export class CommentManager {
    static getAllComments = async (): Promise<IMongoComment[]> => {
        return CommentModel.find().lean().exec();
    };

    static getCommentById = async (id: string): Promise<IMongoComment> => {
        return CommentModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();
    };

    static getCommentsByPostId = async (postId: string): Promise<IMongoComment[]> => {
        return CommentModel.find({ postId: postId }).orFail(new DocumentNotFoundError(postId)).lean().exec();
    };

    static createComment = async (comment: IComment, senderId: string): Promise<IMongoComment> => {
        return CommentModel.create({ ...comment, senderId });
    };

    static updateCommentById = async (
        id: string,
        update: Partial<IComment>,
        senderId: string
    ): Promise<IMongoComment> => {
        const comment = await CommentModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        if (comment.senderId.toString() !== senderId) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to update this comment");
        }

        return CommentModel.findByIdAndUpdate(id, update, { new: true })
            .orFail(new DocumentNotFoundError(id))
            .lean()
            .exec();
    };

    static deleteCommentById = async (id: string, senderId: string): Promise<string> => {
        const comment = await CommentModel.findById(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        if (comment.senderId.toString() !== senderId) {
            throw new ServerError(StatusCodes.FORBIDDEN, "You are not allowed to delete this comment");
        }

        await CommentModel.findByIdAndDelete(id).orFail(new DocumentNotFoundError(id)).lean().exec();

        return `Comment ${id} deleted succesfully`;
    };
}
