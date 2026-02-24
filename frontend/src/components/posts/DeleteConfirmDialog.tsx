import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import type React from "react";

export interface DeleteConfirmDialogProps {
    postId: string | null;
    onClose: () => void;
    deletePost: (id: string, options?: { onSuccess?: () => void }) => void;
    isDeleting: boolean;
    title?: string;
    message?: string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    postId,
    onClose,
    deletePost,
    isDeleting,
    title = "Delete Post",
    message = "Are you sure you want to delete this post? This action cannot be undone.",
}) => {
    const handleConfirm = () => {
        if (postId) {
            deletePost(postId, { onSuccess: onClose });
        }
    };

    return (
        <Dialog open={!!postId} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{message}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isDeleting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color="error"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;
