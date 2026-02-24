import { StatusCodes } from "http-status-codes";
import { DocumentNotFoundError, ServerError } from "../../utils/errors";
import { IComment, IMongoPost, IPost, PostSearchParams, PostSearchResult } from "./interface";
import { PostModel } from "./model";
import { GeminiManager } from "../gemini/manager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongoFilter = Record<string, any>;

const buildFilter = async (params: PostSearchParams, baseFilter: MongoFilter = {}) => {
    const filter: MongoFilter = { ...baseFilter };
    let aiCategories: PostSearchResult["aiCategories"];

    if (params.aiPrompt) {
        aiCategories = await GeminiManager.searchCategories(params.aiPrompt);
        if (aiCategories.length > 0) {
            filter.categories = { $in: aiCategories };
        }
    } else if (params.categories?.length) {
        filter.categories = { $in: params.categories };
    }

    if (params.search) {
        filter.drinkName = { $regex: params.search, $options: "i" };
    }

    if (params.hasLikes) {
        filter["likes.0"] = { $exists: true };
    }

    if (params.hasComments) {
        filter["comments.0"] = { $exists: true };
    }

    return { filter, aiCategories };
};

const buildSort = (sort?: string): Record<string, 1 | -1> => {
    switch (sort) {
        case "oldest":
            return { createdAt: 1 };
        case "most-liked":
            return { likesCount: -1, createdAt: -1 };
        case "most-commented":
            return { commentsCount: -1, createdAt: -1 };
        default:
            return { createdAt: -1 };
    }
};

export class PostManager {
    static getAllPosts = async (params: PostSearchParams): Promise<PostSearchResult> => {
        const { filter, aiCategories } = await buildFilter(params);
        const sortOption = buildSort(params.sort);
        const skip = params.skip || 0;
        const limit = params.limit || 10;

        const needsAggregation = params.sort === "most-liked" || params.sort === "most-commented";

        let posts: IMongoPost[];
        let total: number;

        if (needsAggregation) {
            const pipeline = [
                { $match: filter },
                {
                    $addFields: {
                        likesCount: { $size: "$likes" },
                        commentsCount: { $size: "$comments" },
                    },
                },
                { $sort: sortOption },
                { $skip: skip },
                { $limit: limit },
            ];

            [posts, total] = await Promise.all([
                PostModel.aggregate(pipeline).exec() as Promise<IMongoPost[]>,
                PostModel.countDocuments(filter),
            ]);

            await PostModel.populate(posts, { path: "comments.senderId", select: "username image" });
        } else {
            [posts, total] = await Promise.all([
                PostModel.find(filter)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .populate("comments.senderId", "username image")
                    .lean()
                    .exec(),
                PostModel.countDocuments(filter),
            ]);
        }

        return { posts, total, ...(aiCategories && { aiCategories }) };
    };

    static getPostById = async (id: string): Promise<IMongoPost> => {
        return PostModel.findById(id)
            .orFail(new DocumentNotFoundError(id))
            .populate("comments.senderId", "username image")
            .lean()
            .exec();
    };

    static getPostsBySenderId = async (senderId: string, params: PostSearchParams = {}): Promise<PostSearchResult> => {
        const { filter, aiCategories } = await buildFilter(params, { owner: senderId });
        const sortOption = buildSort(params.sort);

        const needsAggregation = params.sort === "most-liked" || params.sort === "most-commented";

        let posts: IMongoPost[];
        let total: number;

        if (needsAggregation) {
            const pipeline = [
                { $match: filter },
                {
                    $addFields: {
                        likesCount: { $size: "$likes" },
                        commentsCount: { $size: "$comments" },
                    },
                },
                { $sort: sortOption },
            ];

            [posts, total] = await Promise.all([
                PostModel.aggregate(pipeline).exec() as Promise<IMongoPost[]>,
                PostModel.countDocuments(filter),
            ]);

            await PostModel.populate(posts, { path: "comments.senderId", select: "username image" });
        } else {
            [posts, total] = await Promise.all([
                PostModel.find(filter).sort(sortOption).lean().exec(),
                PostModel.countDocuments(filter),
            ]);
        }

        return { posts, total, ...(aiCategories && { aiCategories }) };
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
            .populate("comments.senderId", "username image")
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
            .populate("comments.senderId", "username image")
            .lean()
            .exec();
    };
}
