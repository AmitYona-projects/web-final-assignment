import { Box, Chip } from "@mui/material";
import type React from "react";
import type { DrinkCategory } from "../../types/posts";

export interface DrinkCategoryChipsProps {
    categories: DrinkCategory[];
    sx?: object;
}

const DrinkCategoryChips: React.FC<DrinkCategoryChipsProps> = ({ categories, sx }) => {
    if (!categories?.length) return null;

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, ...sx }}>
            {categories.map((cat) => (
                <Chip key={cat} label={cat} size="small" color="secondary" variant="outlined" />
            ))}
        </Box>
    );
};

export default DrinkCategoryChips;
