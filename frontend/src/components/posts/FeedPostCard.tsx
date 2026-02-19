import { useState } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Box,
    IconButton,
    Button,
} from "@mui/material";
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Comment as CommentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type React from "react";
import type { Post } from "../../services/posts";
import { config } from "../../config";

export interface FeedPostCardProps {
    post: Post;
    currentUserId: string;
    onToggleLike: (postId: string) => void;
}

const FeedPostCard: React.FC<FeedPostCardProps> = ({
    post,
    currentUserId,
    onToggleLike,
}) => {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const hasLiked = post.likes.includes(currentUserId);

    return (
        <Card sx={{ display: "flex", flexDirection: "column", minHeight: 410 }}>
            {post.drinkImage && (
                <CardMedia
                    component="img"
                    height="200"
                    image={`${config.uploadFolderUrl}${post.drinkImage}`}
                    alt={post.drinkName}
                    sx={{ objectFit: "cover" }}
                />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                    {post.drinkName}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        ...(!expanded && {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                        }),
                    }}
                >
                    {post.instructions}
                </Typography>
                {post.instructions.length > 120 && (
                    <Button
                        size="small"
                        onClick={() => setExpanded(!expanded)}
                        sx={{ p: 0, minWidth: "auto", textTransform: "none" }}
                    >
                        {expanded ? "Show less" : "Read more"}
                    </Button>
                )}
            </CardContent>

            <CardActions sx={{ px: 2, justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                        onClick={() => onToggleLike(post._id)}
                        color={hasLiked ? "error" : "default"}
                        aria-label="like"
                    >
                        {hasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                        {post.likes.length}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                        onClick={() => navigate(`/posts/${post._id}`)}
                        aria-label="comments"
                    >
                        <CommentIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                        {post.comments.length}
                    </Typography>
                </Box>
            </CardActions>
        </Card>
    );
};

export default FeedPostCard;
