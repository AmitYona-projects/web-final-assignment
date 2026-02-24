import { Box, Avatar, IconButton } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import type React from "react";

export interface AvatarUploadProps {
    src?: string;
    size?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ src, size = 100, onChange, disabled }) => (
    <Box sx={{ position: "relative", display: "inline-block" }}>
        <Avatar src={src} sx={{ width: size, height: size }} />
        <IconButton
            component="label"
            disabled={disabled}
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
                onChange={onChange}
            />
        </IconButton>
    </Box>
);

export default AvatarUpload;
