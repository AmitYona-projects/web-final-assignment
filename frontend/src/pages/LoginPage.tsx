import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Divider,
    Link,
    Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { GoogleLogin } from "@react-oauth/google";

const loginSchema = z.object({
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
    const { regularLogin, googleLogin } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        regularLogin.mutate(data);
    };

    return (
        <Box sx={{ mx: "auto" }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
                Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Sign in to your account
            </Typography>

            {(regularLogin.isError || googleLogin.isError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {regularLogin.error?.message || googleLogin.error?.message || "Login failed. Please try again."}
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
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
                            sx={{ mb: 3 }}
                            autoComplete="current-password"
                        />
                    )}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting || regularLogin.isPending}
                    sx={{ mb: 2 }}
                >
                    {regularLogin.isPending ? "Signing in..." : "Sign In"}
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
                    Don't have an account?{" "}
                    <Link component={RouterLink} to="/auth/register" underline="hover">
                        Sign up
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default LoginPage;
