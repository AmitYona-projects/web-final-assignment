import { GoogleGenAI } from "@google/genai";
import { config } from "../config";

let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
    if (!aiClient && config.geminiApiKey) {
        aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
    }
    return aiClient;
};

export interface CocktailRecipe {
    drinkName: string;
    instructions: string;
    imagePrompt: string;
}

export const geminiService = {
    generateCocktailRecipe: async (userPrompt: string): Promise<CocktailRecipe> => {
        const ai = getAIClient();

        if (!ai) {
            throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
        }

        const prompt = `תיצור מתכון יצירתי לקוקטייל לפי התיאור הבא "${userPrompt}"

Please provide the response in the following JSON format (without any markdown formatting or code blocks, and only in hebrew):

{
  "drinkName": "שם הקוקטייל",
  "instructions": "מתכון יצירתי לקוקטייל(maximum 950 characters)",
  "imagePrompt": "קישור לתמונה של קוקטייל בסגנון"
}

Keep the instructions detailed but concise (100-300 words). Make the cocktail creative and interesting.`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            const text = response.text?.trim() || "";

            // Remove markdown code blocks if present
            let jsonText = text;
            if (text.startsWith("```")) {
                jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            }

            const recipe = JSON.parse(jsonText) as CocktailRecipe;

            // Validate the response
            if (!recipe.drinkName || !recipe.instructions || !recipe.imagePrompt) {
                throw new Error("Invalid response format from AI");
            }

            return recipe;
        } catch (error) {
            console.error("Error generating cocktail recipe:", error);
            if (error instanceof Error) {
                throw new Error(`Failed to generate recipe: ${error.message}`);
            }
            throw new Error("Failed to generate cocktail recipe");
        }
    },

    generateCocktailImage: async (imagePrompt: string): Promise<string> => {
        // For now, return a placeholder image URL from Unsplash
        // You can integrate with an image generation API like DALL-E later
        const query = encodeURIComponent(imagePrompt);
        return `https://source.unsplash.com/800x600/?cocktail,${query}`;
    },
};
