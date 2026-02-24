import { GeminiManager } from "../express/gemini/manager";
import { DRINK_CATEGORIES } from "../express/posts/interface";

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock GoogleGenAI; capture generateContent so each test can control it.
const mockGenerateContent = jest.fn();
jest.mock("@google/genai", () => ({
    GoogleGenAI: jest.fn(() => ({
        models: {
            generateContent: (...args: unknown[]) => mockGenerateContent(...args),
        },
    })),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const makeResponse = (text: string) => ({ text });

const validRecipeJson = {
    drinkName: "Blue Lagoon",
    instructions: "Stir gently with ice and serve cold.",
    categories: ["sweet", "tropical", "refreshing"],
};

const validCategoriesJson = ["sweet", "tropical"];

// ── GeminiManager.generateCocktailRecipe ──────────────────────────────────

describe("GeminiManager.generateCocktailRecipe", () => {
    beforeEach(() => {
        mockGenerateContent.mockReset();
    });

    test("returns a parsed recipe from clean JSON response", async () => {
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(validRecipeJson)));

        const result = await GeminiManager.generateCocktailRecipe("tropical summer drink");

        expect(result.drinkName).toBe("Blue Lagoon");
        expect(result.instructions).toBe("Stir gently with ice and serve cold.");
        expect(result.categories).toEqual(["sweet", "tropical", "refreshing"]);
    });

    test("strips markdown code-block wrapper before parsing", async () => {
        const wrapped = "```json\n" + JSON.stringify(validRecipeJson) + "\n```";
        mockGenerateContent.mockResolvedValue(makeResponse(wrapped));

        const result = await GeminiManager.generateCocktailRecipe("summer drink");

        expect(result.drinkName).toBe("Blue Lagoon");
    });

    test("strips plain ``` code-block wrapper before parsing", async () => {
        const wrapped = "```\n" + JSON.stringify(validRecipeJson) + "\n```";
        mockGenerateContent.mockResolvedValue(makeResponse(wrapped));

        const result = await GeminiManager.generateCocktailRecipe("summer drink");

        expect(result.drinkName).toBe("Blue Lagoon");
    });

    test("filters out categories that are not in DRINK_CATEGORIES", async () => {
        const json = { ...validRecipeJson, categories: ["sweet", "invalid_cat", "tropical", "unknown"] };
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        const result = await GeminiManager.generateCocktailRecipe("sweet drink");

        expect(result.categories).toEqual(["sweet", "tropical"]);
        expect(result.categories).not.toContain("invalid_cat");
        expect(result.categories).not.toContain("unknown");
    });

    test("returns empty categories array when AI provides none", async () => {
        const json = { drinkName: "Mystery Brew", instructions: "Pour and enjoy.", categories: [] };
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        const result = await GeminiManager.generateCocktailRecipe("mysterious drink");

        expect(result.categories).toEqual([]);
    });

    test("returns empty categories array when AI omits the field", async () => {
        const json = { drinkName: "Plain Sip", instructions: "Just drink it." };
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        const result = await GeminiManager.generateCocktailRecipe("simple drink");

        expect(result.categories).toEqual([]);
    });

    test("only returns categories that are valid DRINK_CATEGORIES entries", async () => {
        const allValid = [...DRINK_CATEGORIES];
        const json = { ...validRecipeJson, categories: allValid };
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        const result = await GeminiManager.generateCocktailRecipe("all categories");

        result.categories.forEach((cat) => {
            expect((DRINK_CATEGORIES as readonly string[]).includes(cat)).toBe(true);
        });
    });

    test("throws when drinkName is missing from AI response", async () => {
        const json = { instructions: "Some steps.", categories: ["sweet"] };
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        await expect(GeminiManager.generateCocktailRecipe("drink")).rejects.toThrow("Invalid response format from AI");
    });

    test("throws when instructions are missing from AI response", async () => {
        const json = { drinkName: "Nameless", categories: ["sour"] };
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        await expect(GeminiManager.generateCocktailRecipe("drink")).rejects.toThrow("Invalid response format from AI");
    });

    test("throws on malformed (non-JSON) AI response", async () => {
        mockGenerateContent.mockResolvedValue(makeResponse("This is not JSON at all."));

        await expect(GeminiManager.generateCocktailRecipe("drink")).rejects.toThrow();
    });

    test("throws when the AI client itself rejects", async () => {
        mockGenerateContent.mockRejectedValue(new Error("API quota exceeded"));

        await expect(GeminiManager.generateCocktailRecipe("drink")).rejects.toThrow("API quota exceeded");
    });

    test("passes the user prompt through to the AI call", async () => {
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(validRecipeJson)));

        await GeminiManager.generateCocktailRecipe("piña colada vibes");

        const calledWith = mockGenerateContent.mock.calls[0][0];
        expect(calledWith.contents).toContain("piña colada vibes");
    });
});

// ── GeminiManager.searchCategories ────────────────────────────────────────

describe("GeminiManager.searchCategories", () => {
    beforeEach(() => {
        mockGenerateContent.mockReset();
    });

    test("returns matching categories from clean JSON array response", async () => {
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(validCategoriesJson)));

        const result = await GeminiManager.searchCategories("something sweet and tropical");

        expect(result).toEqual(["sweet", "tropical"]);
    });

    test("strips markdown code-block wrapper before parsing", async () => {
        const wrapped = "```json\n" + JSON.stringify(validCategoriesJson) + "\n```";
        mockGenerateContent.mockResolvedValue(makeResponse(wrapped));

        const result = await GeminiManager.searchCategories("sweet");

        expect(result).toEqual(["sweet", "tropical"]);
    });

    test("filters out invalid categories returned by AI", async () => {
        const json = ["sweet", "not_a_real_category", "tropical", "fake"];
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        const result = await GeminiManager.searchCategories("sweet tropical");

        expect(result).toEqual(["sweet", "tropical"]);
    });

    test("returns empty array when AI returns no valid categories", async () => {
        const json = ["invalid1", "invalid2"];
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        const result = await GeminiManager.searchCategories("completely unknown");

        expect(result).toEqual([]);
    });

    test("returns empty array when AI returns an empty array", async () => {
        mockGenerateContent.mockResolvedValue(makeResponse("[]"));

        const result = await GeminiManager.searchCategories("nothing matches");

        expect(result).toEqual([]);
    });

    test("throws on malformed (non-JSON) AI response", async () => {
        mockGenerateContent.mockResolvedValue(makeResponse("sweet, tropical"));

        await expect(GeminiManager.searchCategories("sweet")).rejects.toThrow();
    });

    test("throws when the AI client itself rejects", async () => {
        mockGenerateContent.mockRejectedValue(new Error("Service unavailable"));

        await expect(GeminiManager.searchCategories("drink")).rejects.toThrow("Service unavailable");
    });

    test("passes the user prompt through to the AI call", async () => {
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(["fruity"])));

        await GeminiManager.searchCategories("fruity summer vibes");

        const calledWith = mockGenerateContent.mock.calls[0][0];
        expect(calledWith.contents).toContain("fruity summer vibes");
    });

    test("returns only DrinkCategory typed values", async () => {
        const json = ["herbal", "strong", "INVALID_UPPER"];
        mockGenerateContent.mockResolvedValue(makeResponse(JSON.stringify(json)));

        const result = await GeminiManager.searchCategories("herbal strong drink");

        result.forEach((cat) => {
            expect((DRINK_CATEGORIES as readonly string[]).includes(cat)).toBe(true);
        });
    });
});
