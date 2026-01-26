import { Box, FormControl, InputLabel, Select, MenuItem, Chip, Button } from "@mui/material";
import { Favorite as FavoriteIcon, Comment as CommentIcon } from "@mui/icons-material";
import type React from "react";
import type { SortOption } from "../../types/posts";

export interface PostFiltersProps {
    sortBy: SortOption;
    onSortChange: (sortBy: SortOption) => void;
    filterWithLikes: boolean;
    filterWithComments: boolean;
    onFilterChange: (filter: "likes" | "comments", value: boolean) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

const PostFilters: React.FC<PostFiltersProps> = ({
    sortBy,
    onSortChange,
    filterWithLikes,
    filterWithComments,
    onFilterChange,
    onClearFilters,
    hasActiveFilters,
}) => {
    return (
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
    );
};

export default PostFilters;
