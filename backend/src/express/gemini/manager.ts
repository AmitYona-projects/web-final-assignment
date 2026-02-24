import { GoogleGenAI } from "@google/genai";
import config from "../../config";

export interface CocktailRecipe {
    drinkName: string;
    instructions: string;
}

const aiClient = new GoogleGenAI({ apiKey: config.gemini.apiKey });

export class GeminiManager {
    static generateCocktailRecipe = async (userPrompt: string): Promise<CocktailRecipe> => {
        const prompt = `תיצור מתכון יצירתי לקוקטייל לפי התיאור הבא "${userPrompt}"

Please provide the response in the following JSON format (without any markdown formatting or code blocks, and only in hebrew):

{
  "drinkName": "שם הקוקטייל",
  "instructions": "מתכון יצירתי לקוקטייל(maximum 950 characters)",
}

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

        return recipe;
    };
}
