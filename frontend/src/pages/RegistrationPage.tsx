import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Link,
    Stack,
    Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";

const registrationSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username cannot exceed 20 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        email: z.string().email("Invalid email address").min(1, "Email is required"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
    })

type RegistrationFormData = z.infer<typeof registrationSchema>;

const RegistrationPage: React.FC = () => {
    const { register: registerMutation, googleLogin } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: RegistrationFormData) => {
        registerMutation.mutate(data);
    };

    return (
        <Box sx={{ mx: "auto" }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
                Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Sign up to get started
            </Typography>

            {registerMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {registerMutation.error?.message || "Registration failed. Please try again."}
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Username"
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            sx={{ mb: 2 }}
                            autoComplete="username"
                        />
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Email"
                            type="email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{ mb: 2 }}
                            autoComplete="email"
                        />
                    )}
                />

                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="Password"
                            type="password"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{ mb: 2 }}
                            autoComplete="new-password"
                        />
                    )}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || registerMutation.isPending}
                    sx={{ mb: 2 }}
                >
                    {registerMutation.isPending ? "Creating account..." : "Sign Up"}
                </Button>
            </form>

            <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    OR
                </Typography>
            </Divider>

            <Stack direction="row" justifyContent="center" alignItems="center">
                <GoogleLogin
                    onSuccess={googleLogin.triggerFlow}
                    onError={() => console.error("Google login error")}
                    text="continue_with"
                    shape="circle"
                    theme="outline"
                    logo_alignment="center"
                    width="700px"
                />
            </Stack>

            <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Link component={RouterLink} to="/auth/login" underline="hover">
                        Sign in
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default RegistrationPage;
