/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import Joi from "joi";
import { wrapMiddleware } from "./middlewares";

export const emptyRequestSchema = Joi.object({
    query: {},
    params: {},
    body: {},
});

const defaultValidationOptions: Joi.ValidationOptions = {
    abortEarly: false,
    allowUnknown: false,
    convert: true,
};

const normalizeRequest = (req: any, value: any) => {
    req.validated = value;
};

const ValidateRequest = (schema: Joi.ObjectSchema, options: Joi.ValidationOptions = defaultValidationOptions) => {
    const validator = async (req: Request) => {
        const validationTarget = {
            body: req.body,
            query: req.query,
            params: req.params,
        };
        const { error, value } = schema.validate(validationTarget, options);

        if (error) {
            throw error;
        }

        if (options.convert) {
            normalizeRequest(req, value);
        }
    };
    return wrapMiddleware(validator);
};

export const MongoIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/, "valid MongoId");

export default ValidateRequest;
