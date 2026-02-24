import { useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, Chip, Button, TextField, IconButton, CircularProgress, Tooltip } from "@mui/material";
import { Favorite as FavoriteIcon, Comment as CommentIcon, AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import type React from "react";
import { DRINK_CATEGORIES, type SortOption, type DrinkCategory } from "../../types/posts";

export interface PostFiltersProps {
    sortBy: SortOption;
    onSortChange: (sortBy: SortOption) => void;
    filterWithLikes: boolean;
    filterWithComments: boolean;
    onFilterChange: (filter: "likes" | "comments", value: boolean) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    filterCategories?: DrinkCategory[];
    onCategoryToggle?: (category: DrinkCategory) => void;
    onAiCategorySearch?: (prompt: string) => void;
    isAiSearching?: boolean;
}

const PostFilters: React.FC<PostFiltersProps> = ({
    sortBy,
    onSortChange,
    filterWithLikes,
    filterWithComments,
    onFilterChange,
    onClearFilters,
    hasActiveFilters,
    filterCategories = [],
    onCategoryToggle,
    onAiCategorySearch,
    isAiSearching = false,
}) => {
    const [aiPromptInput, setAiPromptInput] = useState("");

    const handleAiSearch = () => {
        if (aiPromptInput.trim() && onAiCategorySearch) {
            onAiCategorySearch(aiPromptInput.trim());
            setAiPromptInput("");
        }
    };

    const handleAiKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAiSearch();
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                    >
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="oldest">Oldest First</MenuItem>
                        <MenuItem value="most-liked">Most Liked</MenuItem>
                        <MenuItem value="most-commented">Most Commented</MenuItem>
                    </Select>
                </FormControl>

                <Chip
                    label="With Likes"
                    onClick={() => onFilterChange("likes", !filterWithLikes)}
                    color={filterWithLikes ? "primary" : "default"}
                    variant={filterWithLikes ? "filled" : "outlined"}
                    icon={<FavoriteIcon />}
                />

                <Chip
                    label="With Comments"
                    onClick={() => onFilterChange("comments", !filterWithComments)}
                    color={filterWithComments ? "primary" : "default"}
                    variant={filterWithComments ? "filled" : "outlined"}
                    icon={<CommentIcon />}
                />

                {hasActiveFilters && (
                    <Button size="small" onClick={onClearFilters}>
                        Clear Filters
                    </Button>
                )}
            </Box>

            {onCategoryToggle && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        {DRINK_CATEGORIES.map((category) => {
                            const active = filterCategories.includes(category);
                            return (
                                <Chip
                                    key={category}
                                    label={category}
                                    clickable
                                    size="small"
                                    color={active ? "secondary" : "default"}
                                    variant={active ? "filled" : "outlined"}
                                    onClick={() => onCategoryToggle(category)}
                                />
                            );
                        })}
                    </Box>

                    {onAiCategorySearch && (
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <TextField
                                size="small"
                                placeholder="Describe a vibe... (e.g. summer party drink)"
                                value={aiPromptInput}
                                onChange={(e) => setAiPromptInput(e.target.value)}
                                onKeyDown={handleAiKeyDown}
                                disabled={isAiSearching}
                                sx={{ flex: 1 }}
                            />
                            <Tooltip title="AI picks the best categories for you">
                                <span>
                                    <IconButton
                                        onClick={handleAiSearch}
                                        disabled={!aiPromptInput.trim() || isAiSearching}
                                        color="secondary"
                                    >
                                        {isAiSearching ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default PostFilters;
