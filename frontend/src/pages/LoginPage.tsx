import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const login = useGoogleLogin({
        flow: "auth-code",
        scope: "profile email",
    });

    const handleLogin = () => {
        const code = login();
        api.post("/auth/login", { code }).then((response) => {
            console.log(response.data);
        });
        handleLoginSuccess();
    };

    const handleLoginSuccess = () => {
        navigate("/");
    };



    return <div>
        <Button onClick={handleLogin}>Login with Google</Button>
    </div>;
};

export default LoginPage;