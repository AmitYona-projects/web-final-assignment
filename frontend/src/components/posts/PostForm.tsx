import { TextField, Stack } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import type React from "react";
import type { PostFormData } from "../../types/posts";

export interface PostFormProps {
    control: Control<PostFormData>;
    errors: FieldErrors<PostFormData>;
    disabled?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ control, errors, disabled = false }) => {
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

            <Controller
                name="drinkImage"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Image URL"
                        fullWidth
                        error={!!errors.drinkImage}
                        helperText={errors.drinkImage?.message}
                        disabled={disabled}
                    />
                )}
            />
        </Stack>
    );
};

export default PostForm;
