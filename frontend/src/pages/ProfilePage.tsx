import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Avatar,
    IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useUser } from "../hooks/useUser";
import { config } from "../config";
import type React from "react";

const profileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
    const { user, isLoading, error, updateUser, isUpdating, updateError, updateSuccess } = useUser();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        values: {
            username: user?.username || "",
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const getAvatarSrc = () => {
        if (imagePreview) return imagePreview;
        if (user?.image) return `${config.uploadFolderUrl}${user.image}`;
        return undefined;
    };

    const onSubmit = (data: ProfileFormData) => {
        updateUser({
            ...data,
            ...(imageFile && { image: imageFile }),
        });
    };

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
                <Alert severity="error">Failed to load profile</Alert>
            </Box>
        );
    }

    if (!user) return null;

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Profile
            </Typography>

            {updateError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {updateError instanceof Error ? updateError.message : "Failed to update profile"}
                </Alert>
            )}

            {updateSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Profile updated successfully
                </Alert>
            )}

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3} alignItems="center">
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    src={getAvatarSrc()}
                                    sx={{ width: 120, height: 120 }}
                                />
                                <IconButton
                                    component="label"
                                    sx={{
                                        position: "absolute",
                                        bottom: -4,
                                        right: -4,
                                        bgcolor: "primary.main",
                                        color: "white",
                                        "&:hover": { bgcolor: "primary.dark" },
                                        width: 36,
                                        height: 36,
                                    }}
                                >
                                    <PhotoCamera fontSize="small" />
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleImageChange}
                                    />
                                </IconButton>
                            </Box>

                            <TextField
                                label="Email"
                                value={user.email}
                                fullWidth
                                disabled
                            />

                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Username"
                                        fullWidth
                                        error={!!errors.username}
                                        helperText={errors.username?.message}
                                        disabled={isUpdating}
                                    />
                                )}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProfilePage;
