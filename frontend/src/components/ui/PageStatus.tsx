import { Box, CircularProgress, Alert } from "@mui/material";
import type React from "react";

export interface PageStatusProps {
    isLoading: boolean;
    error: unknown;
    errorMessage?: string;
    children: React.ReactNode;
}

const PageStatus: React.FC<PageStatusProps> = ({
    isLoading,
    error,
    errorMessage = "Something went wrong",
    children,
}) => {
    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{errorMessage}</Alert>
            </Box>
        );
    }

    return <>{children}</>;
};

export default PageStatus;
