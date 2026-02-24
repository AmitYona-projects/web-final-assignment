import { Divider, Stack, Typography } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import type React from "react";

export interface GoogleAuthSectionProps {
    onSuccess: (credentialResponse: Parameters<React.ComponentProps<typeof GoogleLogin>["onSuccess"]>[0]) => void;
}

const GoogleAuthSection: React.FC<GoogleAuthSectionProps> = ({ onSuccess }) => (
    <>
        <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
                OR
            </Typography>
        </Divider>

        <Stack direction="row" justifyContent="center" alignItems="center">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={() => console.error("Google login error")}
                text="continue_with"
                shape="circle"
                theme="outline"
                logo_alignment="center"
                width="700px"
            />
        </Stack>
    </>
);

export default GoogleAuthSection;
