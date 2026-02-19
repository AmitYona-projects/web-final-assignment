import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Alert, Divider, Chip } from "@mui/material";
import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import type { Control, UseFormHandleSubmit } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import type React from "react";
import type { Post } from "../../services/posts";
import type { PostFormData } from "../../types/posts";
import PostForm from "./PostForm";
import AIGeneratorSection from "./AIGeneratorSection";

export interface PostDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: PostFormData) => void;
    post?: Post | null;
    isSubmitting: boolean;
    control: Control<PostFormData>;
    handleSubmit: UseFormHandleSubmit<PostFormData>;
    errors: FieldErrors<PostFormData>;
    aiPrompt: string;
    onAiPromptChange: (prompt: string) => void;
    onGenerateWithAI: () => void;
    isGenerating: boolean;
    aiError: string | null;
    onAiErrorDismiss: () => void;
    imagePreview?: string;
    onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PostDialog: React.FC<PostDialogProps> = ({
    open,
    onClose,
    onSubmit,
    post,
    isSubmitting,
    control,
    handleSubmit,
    errors,
    aiPrompt,
    onAiPromptChange,
    onGenerateWithAI,
    isGenerating,
    aiError,
    onAiErrorDismiss,
    imagePreview,
    onImageChange,
}) => {
    const isEditMode = !!post;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEditMode ? "Edit Post" : "Create New Cocktail Post"}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={3}>
                        {!isEditMode && (
                            <>
                                <Alert severity="info" icon={<AutoAwesomeIcon />}>
                                    Try our AI assistant! Describe the cocktail you want and let AI generate the recipe for you.
                                </Alert>

                                <AIGeneratorSection
                                    prompt={aiPrompt}
                                    onPromptChange={onAiPromptChange}
                                    onGenerate={onGenerateWithAI}
                                    isGenerating={isGenerating}
                                    error={aiError}
                                    onErrorDismiss={onAiErrorDismiss}
                                />

                                <Divider>
                                    <Chip label="OR enter manually below" size="small" />
                                </Divider>
                            </>
                        )}

                        <PostForm
                            control={control}
                            errors={errors}
                            disabled={isSubmitting}
                            imagePreview={imagePreview}
                            onImageChange={onImageChange}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting
                            ? "Saving..."
                            : isEditMode
                                ? "Update"
                                : "Create"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PostDialog;
