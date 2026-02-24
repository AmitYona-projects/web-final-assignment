import Joi from "joi";
import { emptyRequestSchema } from "../../utils/express/joi";

export const generateRecipeSchema = emptyRequestSchema.keys({
    body: {
        prompt: Joi.string().min(1).max(500).required(),
    },
});
