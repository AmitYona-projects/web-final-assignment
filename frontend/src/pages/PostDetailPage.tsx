import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Typography,
    IconButton,
    Button,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
} from "@mui/material";
import { PageStatus } from "../components/ui";
import { DrinkCategoryChips } from "../components/posts";
import {
    ArrowBack as ArrowBackIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
} from "@mui/icons-material";
import { postsService } from "../services/posts";
import { useUser } from "../hooks/useUser";
import { ALL_POSTS_QUERY_KEY } from "../hooks/useAllPosts";
import { config } from "../config";
import type React from "react";

const POST_DETAIL_KEY = (id: string) => ["posts", "detail", id] as const;

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState("");

    const { data: post, isLoading, error } = useQuery({
        queryKey: POST_DETAIL_KEY(id!),
        queryFn: () => postsService.getPostById(id!),
        enabled: !!id,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: POST_DETAIL_KEY(id!) });
        queryClient.invalidateQueries({ queryKey: ALL_POSTS_QUERY_KEY });
    };

    const toggleLikeMutation = useMutation({
        mutationFn: () => postsService.toggleLike(id!),
        onSuccess: invalidate,
    });

    const addCommentMutation = useMutation({
        mutationFn: (text: string) => postsService.addComment(id!, text),
        onSuccess: () => {
            invalidate();
            setCommentText("");
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => postsService.deleteComment(id!, commentId),
        onSuccess: invalidate,
    });

    const handleAddComment = () => {
        if (commentText.trim()) {
            addCommentMutation.mutate(commentText.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    const currentUserId = user?._id || "";
    const hasLiked = post.likes.includes(currentUserId);

    return (
        <PageStatus isLoading={isLoading} error={error || !post} errorMessage="Failed to load post">
        <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
                sx={{ mb: 2 }}
            >
                Back to Feed
            </Button>

            <Card>
                {post.drinkImage && (
                    <CardMedia
                        component="img"
                        height="350"
                        image={`${config.uploadFolderUrl}${post.drinkImage}`}
                        alt={post.drinkName}
                        sx={{ objectFit: "cover" }}
                    />
                )}
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {post.drinkName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                        {post.instructions}
                    </Typography>

                    <DrinkCategoryChips categories={post!.categories} sx={{ mt: 2 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                        <IconButton
                            onClick={() => toggleLikeMutation.mutate()}
                            color={hasLiked ? "error" : "default"}
                            aria-label="like"
                        >
                            {hasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                        <Typography variant="body2" color="text.secondary">
                            {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Comments ({post.comments.length})
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={addCommentMutation.isPending}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddComment}
                            disabled={!commentText.trim() || addCommentMutation.isPending}
                            sx={{ minWidth: "auto", px: 2 }}
                        >
                            <SendIcon fontSize="small" />
                        </Button>
                    </Box>

                    <Divider />

                    {post.comments.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                            No comments yet. Be the first to comment!
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {post.comments.map((comment, index) => (
                                <Box key={comment._id}>
                                    <ListItem
                                        disableGutters
                                        sx={{ py: 1.5 }}
                                        secondaryAction={
                                            (comment.senderId._id === currentUserId || post.owner === currentUserId) && (
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => deleteCommentMutation.mutate(comment._id)}
                                                    aria-label="delete comment"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={comment.senderId.image ? `${config.uploadFolderUrl}${comment.senderId.image}` : undefined}
                                                sx={{ width: 36, height: 36 }}
                                            >
                                                {comment.senderId.username?.[0]?.toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                                                    <Typography variant="subtitle2" component="span">
                                                        {comment.senderId.username}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" component="span">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={comment.commentText}
                                        />
                                    </ListItem>
                                    {index < post.comments.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
        </Box>
        </PageStatus>
    );
};

export default PostDetailPage;
