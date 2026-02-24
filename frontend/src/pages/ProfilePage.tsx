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
} from "@mui/material";
import { useUser } from "../hooks/useUser";
import { useImageUpload } from "../hooks/useImageUpload";
import { config } from "../config";
import { PageStatus, AvatarUpload } from "../components/ui";
import type React from "react";

const profileSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username cannot exceed 20 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
    const { user, isLoading, error, updateUser, isUpdating, updateError, updateSuccess } = useUser();
    const { imageFile, imagePreview, handleImageChange } = useImageUpload();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        values: { username: user?.username || "" },
    });

    const getAvatarSrc = () => {
        if (imagePreview) return imagePreview;
        if (user?.image) return `${config.uploadFolderUrl}${user.image}`;
        return undefined;
    };

    const onSubmit = (data: ProfileFormData) => {
        updateUser({ ...data, ...(imageFile && { image: imageFile }) });
    };

    return (
        <PageStatus isLoading={isLoading} error={error} errorMessage="Failed to load profile">
            {user && (
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
                                    <AvatarUpload
                                        src={getAvatarSrc()}
                                        size={120}
                                        onChange={handleImageChange}
                                        disabled={isUpdating}
                                    />

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
            )}
        </PageStatus>
    );
};

export default ProfilePage;
