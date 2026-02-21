import { TextField, Stack, Box, IconButton, Typography } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import type React from "react";
import type { PostFormData } from "../../types/posts";

export interface PostFormProps {
    control: Control<PostFormData>;
    errors: FieldErrors<PostFormData>;
    disabled?: boolean;
    imagePreview?: string;
    onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PostForm: React.FC<PostFormProps> = ({ control, errors, disabled = false, imagePreview, onImageChange }) => {
    return (
        <Stack spacing={3}>
            <Controller
                name="drinkName"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Drink Name"
                        fullWidth
                        error={!!errors.drinkName}
                        helperText={errors.drinkName?.message}
                        disabled={disabled}
                    />
                )}
            />

            <Controller
                name="instructions"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Instructions"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.instructions}
                        helperText={errors.instructions?.message}
                        disabled={disabled}
                    />
                )}
            />

            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Drink Image
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {imagePreview && (
                        <Box
                            component="img"
                            src={imagePreview}
                            alt="Drink preview"
                            sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: 1 }}
                        />
                    )}
                    <IconButton component="label" color="primary" disabled={disabled}>
                        <PhotoCamera />
                        <input
                            type="file"
                            hidden
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={onImageChange}
                        />
                    </IconButton>
                </Box>
            </Box>
        </Stack>
    );
};

export default PostForm;
