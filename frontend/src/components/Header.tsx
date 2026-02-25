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
} from "@mui/material";
import {
    AccountCircle,
    Logout,
    Person,
    Home,
    Article,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import type React from "react";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { config } from "../config";



const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { user } = useUser();

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

    const profileMenuItems: { label: string; icon: React.ReactNode; onClick?: () => void }[] = [
        { label: "My Profile", icon: <Person />, onClick: handleProfileClick },
        { label: "Logout", icon: <Logout />, onClick: handleLogout },
    ];

    const navBarItems: { label: string; icon: React.ReactNode; path: string }[] = [
        { label: "Home", icon: <Home />, path: "/" },
        { label: "Profile", icon: <Person />, path: "/profile" },
        { label: "My Posts", icon: <Article />, path: "/posts/my" },
    ];

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
                        CocktailAi
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {navBarItems.map((item) => (
                        <Button key={item.label} component={Link} to={item.path} color="inherit" startIcon={item.icon} sx={{
                            backgroundColor: isActive(item.path) ? "rgba(255, 255, 255, 0.1)" : "transparent",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                        }}>
                            {item.label}
                        </Button>
                    ))}
                    <IconButton onClick={handleMenuOpen} color="inherit" sx={{ ml: 1 }}>
                        <Avatar
                            src={user?.image ? `${config.uploadFolderUrl}${user.image}` : undefined}
                            sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                        >
                            {!user?.image && <AccountCircle />}
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
                        {profileMenuItems.map((item) => (
                            <MenuItem key={item.label} onClick={item.onClick}>
                                {item.icon}
                                {item.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;