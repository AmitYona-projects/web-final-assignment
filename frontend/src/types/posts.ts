import { z } from "zod";

export const DRINK_CATEGORIES = [
    "sweet",
    "spicy",
    "sour",
    "bitter",
    "fruity",
    "creamy",
    "refreshing",
    "strong",
    "tropical",
    "herbal",
] as const;

export type DrinkCategory = (typeof DRINK_CATEGORIES)[number];

export const postSchema = z.object({
    drinkName: z
        .string()
        .min(1, "Drink name is required")
        .max(100, "Drink name cannot exceed 100 characters"),
    instructions: z
        .string()
        .min(10, "Instructions must be at least 10 characters")
        .max(1000, "Instructions cannot exceed 1000 characters"),
    categories: z
        .array(z.enum(DRINK_CATEGORIES))
        .optional()
});

export type PostFormData = z.infer<typeof postSchema>;

export type SortOption = "newest" | "oldest" | "most-liked" | "most-commented";
