import Joi from "joi";
import { emptyRequestSchema, MongoIdSchema } from "../../utils/express/joi";
import { DRINK_CATEGORIES } from "./interface";

const categoriesSchema = Joi.array()
    .items(Joi.string().valid(...DRINK_CATEGORIES))
    .single()
    .optional();

const searchQuerySchema = {
    skip: Joi.number().integer().min(0).optional(),
    limit: Joi.number().integer().min(1).max(50).optional(),
    search: Joi.string().max(200).optional(),
    categories: categoriesSchema,
    sort: Joi.string().valid("newest", "oldest", "most-liked", "most-commented").optional(),
    hasLikes: Joi.string().valid("true", "false").optional(),
    hasComments: Joi.string().valid("true", "false").optional(),
    aiPrompt: Joi.string().max(500).optional(),
};

export const getAllPostsSchema = emptyRequestSchema.keys({
    query: searchQuerySchema,
});

export const getPostByIdSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});

export const getPostsBySenderIdSchema = emptyRequestSchema.keys({
    query: {
        senderId: MongoIdSchema.required(),
        ...searchQuerySchema,
    },
});

export const createPostSchema = emptyRequestSchema.keys({
    body: {
        drinkName: Joi.string().required(),
        instructions: Joi.string().required(),
        categories: categoriesSchema,
    },
});

export const updatePostSchema = emptyRequestSchema.keys({
    body: {
        drinkName: Joi.string().optional(),
        instructions: Joi.string().optional(),
        categories: categoriesSchema,
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
