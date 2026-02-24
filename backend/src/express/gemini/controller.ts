import { Request, Response } from "express";
import { GeminiManager } from "./manager";

export class GeminiController {
    static generateCocktailRecipe = async (req: Request, res: Response) => {
        res.json(await GeminiManager.generateCocktailRecipe(req.body.prompt));
    };
}
