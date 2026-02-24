import { Box, Typography } from "@mui/material";
import type React from "react";

export interface EmptyStateProps {
    hasPosts: boolean;
    hasFilters: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasPosts }) => {
    return (
        <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
                {hasPosts
                    ? "No posts match your filters."
                    : "No posts yet. Create your first drink post!"}
            </Typography>
        </Box>
    );
};

export default EmptyState;
