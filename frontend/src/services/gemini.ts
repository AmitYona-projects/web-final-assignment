import api from "./api";
import type { DrinkCategory } from "../types/posts";

export interface CocktailRecipe {
    drinkName: string;
    instructions: string;
    categories: DrinkCategory[];
}

export const geminiService = {
    generateCocktailRecipe: async (userPrompt: string): Promise<CocktailRecipe> => {
        const response = await api.post<CocktailRecipe>("/gemini/generate-recipe", { prompt: userPrompt });
        return response.data;
    },
};
