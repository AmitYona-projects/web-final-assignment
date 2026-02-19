import { Box } from "@mui/material";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            <Header />
            <Outlet />
        </Box>
    );
};

export default AppLayout;