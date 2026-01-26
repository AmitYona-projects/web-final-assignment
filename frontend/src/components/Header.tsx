import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    useTheme,
} from "@mui/material";
import {
    AccountCircle,
    Logout,
    Person,
    Home,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import type React from "react";
import { useAuth } from "../hooks/useAuth";

const Header: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, isAuthenticated } = useAuth();
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
    };

    const handleProfileClick = () => {
        navigate("/profile");
        handleMenuClose();
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <AppBar position="static" elevation={2}>
            <Toolbar sx={{ justifyContent: "space-between", px: 4 }}>
                <Box
                    component={Link}
                    to="/"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        textDecoration: "none",
                        color: "inherit",
                        "&:hover": {
                            opacity: 0.8,
                        },
                    }}
                >
                    <Home sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Social App
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                        component={Link}
                        to="/"
                        color="inherit"
                        startIcon={<Home />}
                        sx={{
                            backgroundColor: isActive("/") ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                        }}
                    >
                        Home
                    </Button>

                    {isAuthenticated ? (
                        <>
                            <Button
                                component={Link}
                                to="/profile"
                                color="inherit"
                                startIcon={<Person />}
                                sx={{
                                    backgroundColor: isActive("/profile") ? "rgba(255, 255, 255, 0.1)" : "transparent",
                                    "&:hover": {
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    },
                                }}
                            >
                                Profile
                            </Button>
                            <IconButton onClick={handleMenuOpen} color="inherit" sx={{ ml: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                                    <AccountCircle />
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                            >
                                <MenuItem onClick={handleProfileClick}>
                                    <Person sx={{ mr: 1 }} />
                                    My Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <Logout sx={{ mr: 1 }} />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button
                                component={Link}
                                to="/auth/login"
                                color="inherit"
                                sx={{
                                    backgroundColor: isActive("/auth/login") ? "rgba(255, 255, 255, 0.1)" : "transparent",
                                    "&:hover": {
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    },
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                component={Link}
                                to="/auth/register"
                                variant="contained"
                                sx={{
                                    backgroundColor: "white",
                                    color: theme.palette.primary.main,
                                    "&:hover": {
                                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    },
                                }}
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;