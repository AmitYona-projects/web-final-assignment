import api from "./api";

export interface CocktailRecipe {
    drinkName: string;
    instructions: string;
}

export const geminiService = {
    generateCocktailRecipe: async (userPrompt: string): Promise<CocktailRecipe> => {
        const response = await api.post<CocktailRecipe>("/gemini/generate-recipe", { prompt: userPrompt });
        return response.data;
    },
};
