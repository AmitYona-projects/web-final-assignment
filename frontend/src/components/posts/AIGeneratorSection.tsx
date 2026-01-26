import { Box, Typography, TextField, Button, Alert, Stack, CircularProgress } from "@mui/material";
import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import type React from "react";

export interface AIGeneratorSectionProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    error: string | null;
    onErrorDismiss: () => void;
}

const AIGeneratorSection: React.FC<AIGeneratorSectionProps> = ({
    prompt,
    onPromptChange,
    onGenerate,
    isGenerating,
    error,
    onErrorDismiss,
}) => {
    return (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                AI Recipe Generator
            </Typography>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="E.g., 'A tropical cocktail with rum and pineapple' or 'A refreshing summer drink with mint'"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    disabled={isGenerating}
                />
                {error && (
                    <Alert severity="error" onClose={onErrorDismiss}>
                        {error}
                    </Alert>
                )}
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
                    onClick={onGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    fullWidth
                >
                    {isGenerating ? "Generating..." : "Generate Recipe with AI"}
                </Button>
            </Stack>
        </Box>
    );
};

export default AIGeneratorSection;
