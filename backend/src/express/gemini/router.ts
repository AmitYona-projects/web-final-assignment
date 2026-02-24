import { Router } from "express";
import ValidateRequest from "../../utils/express/joi";
import { generateRecipeSchema } from "./validator";
import { GeminiController } from "./controller";
import { wrapController } from "../../utils/express/middlewares";
import { authMiddleware } from "../auth/middleware";

const geminiRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Gemini
 *   description: AI-powered cocktail recipe generation
 */

/**
 * @swagger
 * /gemini/generate-recipe:
 *   post:
 *     summary: Generate a cocktail recipe using AI
 *     tags: [Gemini]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description of the cocktail to generate
 *                 example: "קוקטייל טרופי עם רום"
 *     responses:
 *       '200':
 *         description: Generated cocktail recipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 drinkName:
 *                   type: string
 *                 instructions:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 *       '400':
 *         $ref: '#/components/responses/BadRequestError'
 *       '401':
 *         $ref: '#/components/responses/UnauthorizedError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */
geminiRouter.post(
    "/generate-recipe",
    authMiddleware,
    ValidateRequest(generateRecipeSchema),
    wrapController(GeminiController.generateCocktailRecipe)
);

export default geminiRouter;
