import { useState } from "react";
import type React from "react";

export const useImageUpload = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetImage = () => {
        setImageFile(null);
        setImagePreview(undefined);
    };

    return { imageFile, imagePreview, handleImageChange, resetImage, setImagePreview };
};
