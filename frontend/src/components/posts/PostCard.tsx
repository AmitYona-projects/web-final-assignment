import {
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Box,
    Chip,
    IconButton,
} from "@mui/material";
import DrinkCategoryChips from "./DrinkCategoryChips";
import { Edit as EditIcon, Delete as DeleteIcon, Favorite as FavoriteIcon, Comment as CommentIcon } from "@mui/icons-material";
import type React from "react";
import type { Post } from "../../services/posts";
import { config } from "../../config";

export interface PostCardProps {
    post: Post;
    onEdit: (post: Post) => void;
    onDelete: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete }) => {
    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardMedia
                component="img"
                height="200"
                image={post.drinkImage ? `${config.uploadFolderUrl}${post.drinkImage}` : undefined}
                alt={post.drinkName}
                sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                    {post.drinkName}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {post.instructions}
                </Typography>
                <DrinkCategoryChips categories={post.categories} sx={{ mt: 1 }} />
                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                    <Chip
                        icon={<FavoriteIcon />}
                        label={post.likes.length}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        icon={<CommentIcon />}
                        label={post.comments.length}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </CardContent>
            <CardActions>
                <IconButton
                    size="small"
                    onClick={() => onEdit(post)}
                    aria-label="edit"
                >
                    <EditIcon />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => onDelete(post._id)}
                    aria-label="delete"
                    color="error"
                >
                    <DeleteIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default PostCard;
