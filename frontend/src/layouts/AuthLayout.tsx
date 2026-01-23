import { Outlet } from "react-router-dom";
import { Box, Container, Card, CardContent } from "@mui/material";

const AuthLayout: React.FC = () => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.default",
                padding: 2,
            }}
        >
            <Container maxWidth="sm">
                <Card elevation={3}>
                    <CardContent sx={{ p: 4 }}>
                        <Outlet />
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default AuthLayout;
