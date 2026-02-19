import Joi from "joi";
import { emptyRequestSchema, MongoIdSchema } from "../../utils/express/joi";

export const getPostByIdSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});

export const getPostsBySenderIdSchema = emptyRequestSchema.keys({
    query: {
        senderId: MongoIdSchema.required(),
    },
});

export const createPostSchema = emptyRequestSchema.keys({
    body: {
        drinkName: Joi.string().required(),
        instructions: Joi.string().required(),
    },
});

export const updatePostSchema = emptyRequestSchema.keys({
    body: {
        drinkName: Joi.string().optional(),
        instructions: Joi.string().optional(),
    },
    params: {
        id: MongoIdSchema.required(),
    },
});

export const deletePostByIdSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});

export const toggleLikeSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});

export const addCommentSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
    body: {
        commentText: Joi.string().min(1).max(500).required(),
    },
});

export const deleteCommentSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
        commentId: MongoIdSchema.required(),
    },
});
