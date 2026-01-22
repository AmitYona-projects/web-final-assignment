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
        title: Joi.string().required(),
        description: Joi.string().required(),
    },
});

export const updatePostSchema = emptyRequestSchema.keys({
    body: {
        title: Joi.string().optional(),
        description: Joi.string().optional(),
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
