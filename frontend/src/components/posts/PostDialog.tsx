import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Alert, Divider, Chip } from "@mui/material";
import { AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import type React from "react";
import type { Post, CreatePostRequest, UpdatePostRequest } from "../../services/posts";
import { postSchema, type PostFormData } from "../../types/posts";
import { geminiService } from "../../services/gemini";
import { config } from "../../config";
import { useImageUpload } from "../../hooks/useImageUpload";
import PostForm from "./PostForm";
import AIGeneratorSection from "./AIGeneratorSection";

export interface PostDialogProps {
    open: boolean;
    onClose: () => void;
    post?: Post | null;
    createPost: (data: CreatePostRequest, options?: { onSuccess?: () => void }) => void;
    updatePost: (params: { id: string; data: UpdatePostRequest }, options?: { onSuccess?: () => void }) => void;
    isCreating: boolean;
    isUpdating: boolean;
}

const PostDialog: React.FC<PostDialogProps> = ({
    open,
    onClose,
    post,
    createPost,
    updatePost,
    isCreating,
    isUpdating,
}) => {
    const isEditMode = !!post;
    const isSubmitting = isCreating || isUpdating;

    const { imageFile, imagePreview, handleImageChange, resetImage, setImagePreview } = useImageUpload();
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: { drinkName: "", instructions: "", categories: [] },
    });

    useEffect(() => {
        if (open) {
            if (post) {
                reset({
                    drinkName: post.drinkName,
                    instructions: post.instructions,
                    categories: post.categories || [],
                });
                setImagePreview(post.drinkImage ? `${config.uploadFolderUrl}${post.drinkImage}` : undefined);
            } else {
                reset({ drinkName: "", instructions: "", categories: [] });
                resetImage();
            }
            setAiPrompt("");
            setAiError(null);
        }
    }, [open, post, reset]);

    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim()) {
            setAiError("Please enter a description for the cocktail you want to create");
            return;
        }
        setIsGenerating(true);
        setAiError(null);
        try {
            const recipe = await geminiService.generateCocktailRecipe(aiPrompt);
            reset({
                drinkName: recipe.drinkName,
                instructions: recipe.instructions,
                categories: recipe.categories || [],
            });
            setAiPrompt("");
        } catch (err) {
            console.error("AI generation error:", err);
            setAiError(err instanceof Error ? err.message : "Failed to generate cocktail recipe");
        } finally {
            setIsGenerating(false);
        }
    };

    const onSubmit = (data: PostFormData) => {
        if (post) {
            updatePost(
                { id: post._id, data: { ...data, ...(imageFile && { drinkImage: imageFile }) } },
                { onSuccess: onClose }
            );
        } else {
            createPost(
                { ...data, ...(imageFile && { drinkImage: imageFile }) },
                { onSuccess: onClose }
            );
        }
    };

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
                                    onPromptChange={setAiPrompt}
                                    onGenerate={handleGenerateWithAI}
                                    isGenerating={isGenerating}
                                    error={aiError}
                                    onErrorDismiss={() => setAiError(null)}
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
                            onImageChange={handleImageChange}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PostDialog;
