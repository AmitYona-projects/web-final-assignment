import Joi from "joi";
import { emptyRequestSchema, MongoIdSchema } from "../../utils/express/joi";

export const getCommentByIdSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});

export const getCommentsByPostIdSchema = emptyRequestSchema.keys({
    params: {
        postId: MongoIdSchema.required(),
    },
});

export const createCommentSchema = emptyRequestSchema.keys({
    body: {
        postId: MongoIdSchema.required(),
        commentText: Joi.string().required(),
    },
});

export const updateCommentSchema = emptyRequestSchema.keys({
    body: {
        postId: MongoIdSchema.optional(),
        commentText: Joi.string().optional(),
    },
    params: {
        id: MongoIdSchema.required(),
    },
});

export const deleteCommentByIdSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});
