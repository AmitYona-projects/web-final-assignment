import Joi from "joi";

import { emptyRequestSchema } from "../../utils/express/joi";

export const loginSchema = emptyRequestSchema.keys({
    body: {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    },
});

export const registerSchema = emptyRequestSchema.keys({
    body: {
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        username: Joi.string().required(),
    },
});

export const logoutSchema = emptyRequestSchema.keys({
    body: {
        refreshToken: Joi.string().required(),
    },
});

export const refreshTokenSchema = emptyRequestSchema.keys({
    body: {
        refreshToken: Joi.string().required(),
    },
});
