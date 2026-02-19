import { useState } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Box,
    IconButton,
    TextField,
    Button,
    Collapse,
    List,
    ListItem,
    ListItemText,
    Divider,
} from "@mui/material";
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Comment as CommentIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
} from "@mui/icons-material";
import type React from "react";
import type { Post } from "../../services/posts";
import { config } from "../../config";

export interface FeedPostCardProps {
    post: Post;
    currentUserId: string;
    onToggleLike: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onDeleteComment: (postId: string, commentId: string) => void;
}

const FeedPostCard: React.FC<FeedPostCardProps> = ({
    post,
    currentUserId,
    onToggleLike,
    onAddComment,
    onDeleteComment,
}) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");

    const hasLiked = post.likes.includes(currentUserId);

    const handleAddComment = () => {
        if (commentText.trim()) {
            onAddComment(post._id, commentText.trim());
            setCommentText("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    return (
        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {post.instructions}
                </Typography>
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
                        onClick={() => setShowComments(!showComments)}
                        color={showComments ? "primary" : "default"}
                        aria-label="comments"
                    >
                        <CommentIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                        {post.comments.length}
                    </Typography>
                </Box>
            </CardActions>

            <Collapse in={showComments}>
                <Divider />
                <Box sx={{ px: 2, py: 1 }}>
                    {post.comments.length > 0 && (
                        <List dense disablePadding>
                            {post.comments.map((comment) => (
                                <ListItem
                                    key={comment._id}
                                    disableGutters
                                    secondaryAction={
                                        (comment.senderId === currentUserId || post.owner === currentUserId) && (
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={() => onDeleteComment(post._id, comment._id)}
                                                aria-label="delete comment"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }
                                >
                                    <ListItemText
                                        primary={comment.commentText}
                                        secondary={new Date(comment.createdAt).toLocaleDateString()}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 1 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddComment}
                            disabled={!commentText.trim()}
                            sx={{ minWidth: "auto", px: 2 }}
                        >
                            <SendIcon fontSize="small" />
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Card>
    );
};

export default FeedPostCard;
