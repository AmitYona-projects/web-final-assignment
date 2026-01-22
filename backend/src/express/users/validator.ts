import Joi from "joi";
import { emptyRequestSchema, MongoIdSchema } from "../../utils/express/joi";

export const getUserByIdSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});

export const createUserSchema = emptyRequestSchema.keys({
    body: {
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        password: Joi.string().required(),
    },
});

export const updateUserSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
    body: {
        username: Joi.string().optional(),
        password: Joi.string().optional(),
    },
});

export const deleteUserByIdSchema = emptyRequestSchema.keys({
    params: {
        id: MongoIdSchema.required(),
    },
});
