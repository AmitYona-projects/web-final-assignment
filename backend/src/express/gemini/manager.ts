import { GoogleGenAI } from "@google/genai";
import config from "../../config";
import { DRINK_CATEGORIES, DrinkCategory } from "../posts/interface";

export interface CocktailRecipe {
    drinkName: string;
    instructions: string;
    categories: DrinkCategory[];
}

const aiClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });

export class GeminiManager {
    static generateCocktailRecipe = async (userPrompt: string): Promise<CocktailRecipe> => {
        const prompt = `תיצור מתכון יצירתי לקוקטייל לפי התיאור הבא "${userPrompt}"

Please provide the response in the following JSON format (without any markdown formatting or code blocks, and only in hebrew except the categories):

{
  "drinkName": "שם הקוקטייל",
  "instructions": "מתכון יצירתי לקוקטייל(maximum 950 characters)",
  "categories": ["category1", "category2"]
}

The categories MUST be chosen from this list only: ${DRINK_CATEGORIES.join(", ")}.
Pick 2-4 categories that best describe the cocktail.

Keep the instructions detailed but concise (100-300 words). Make the cocktail creative and interesting.`;

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text?.trim() || "";

        let jsonText = text;
        if (text.startsWith("```")) {
            jsonText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
        }

        const recipe = JSON.parse(jsonText) as CocktailRecipe;

        if (!recipe.drinkName || !recipe.instructions) {
            throw new Error("Invalid response format from AI");
        }

        recipe.categories = (recipe.categories || []).filter((c) =>
            (DRINK_CATEGORIES as readonly string[]).includes(c)
        );

        return recipe;
    };

    static searchCategories = async (userPrompt: string): Promise<DrinkCategory[]> => {
        const prompt = `Given this search query about cocktails: "${userPrompt}"

Pick the most relevant categories from this list: ${DRINK_CATEGORIES.join(", ")}.

Respond ONLY with a JSON array of matching category strings, nothing else. Example: ["sweet", "tropical"]`;

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = response.text?.trim() || "";

        let jsonText = text;
        if (text.startsWith("```")) {
            jsonText = text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
        }

        const categories = JSON.parse(jsonText) as string[];

        return categories.filter((c) => (DRINK_CATEGORIES as readonly string[]).includes(c)) as DrinkCategory[];
    };
}
