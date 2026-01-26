import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    Typography,
    Alert,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Grid,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useUser } from "../hooks/useUser";
import { usePosts } from "../hooks/usePosts";
import { geminiService } from "../services/gemini";
import { postSchema, type PostFormData, type SortOption } from "../types/posts";
import type { Post, CreatePostRequest } from "../services/posts";
import {
    PostCard,
    SearchBar,
    PostFilters,
    PostDialog,
    DeleteConfirmDialog,
    EmptyState,
} from "../components/posts";
import type React from "react";

const MyPostsPage: React.FC = () => {
    const { user } = useUser();
    const { posts = [], isLoading, error, createPost, updatePost, deletePost, isCreating, isUpdating, isDeleting } = usePosts(user?._id || "");

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterWithLikes, setFilterWithLikes] = useState(false);
    const [filterWithComments, setFilterWithComments] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            drinkName: "",
            instructions: "",
            drinkImage: "",
        },
    });

    // Filter and sort posts
    const filteredAndSortedPosts = useMemo(() => {
        let filtered = [...posts];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter((post) =>
                post.drinkName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply likes filter
        if (filterWithLikes) {
            filtered = filtered.filter((post) => post.likes.length > 0);
        }

        // Apply comments filter
        if (filterWithComments) {
            filtered = filtered.filter((post) => post.comments.length > 0);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "most-liked":
                    return b.likes.length - a.likes.length;
                case "most-commented":
                    return b.comments.length - a.comments.length;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [posts, searchTerm, sortBy, filterWithLikes, filterWithComments]);

    const handleOpenDialog = (post?: Post) => {
        if (post) {
            setEditingPost(post);
            reset({
                drinkName: post.drinkName,
                instructions: post.instructions,
                drinkImage: post.drinkImage,
            });
        } else {
            setEditingPost(null);
            reset({
                drinkName: "",
                instructions: "",
                drinkImage: "",
            });
        }
        setAiPrompt("");
        setAiError(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingPost(null);
        setAiPrompt("");
        setAiError(null);
        reset();
    };

    const handleGenerateWithAI = async () => {
        if (!aiPrompt.trim()) {
            setAiError("Please enter a description for the cocktail you want to create");
            return;
        }

        setIsGenerating(true);
        setAiError(null);

        try {
            const recipe = await geminiService.generateCocktailRecipe(aiPrompt);
            const imageUrl = await geminiService.generateCocktailImage(recipe.imagePrompt);

            reset({
                drinkName: recipe.drinkName,
                instructions: recipe.instructions,
                drinkImage: imageUrl,
            });

            setAiPrompt("");
        } catch (error) {
            console.error("AI generation error:", error);
            setAiError(error instanceof Error ? error.message : "Failed to generate cocktail recipe");
        } finally {
            setIsGenerating(false);
        }
    };

    const onSubmit = (data: PostFormData) => {
        if (editingPost) {
            updatePost(
                { id: editingPost._id, data },
                {
                    onSuccess: () => {
                        handleCloseDialog();
                    },
                }
            );
        } else {
            createPost(data as CreatePostRequest, {
                onSuccess: () => {
                    handleCloseDialog();
                },
            });
        }
    };

    const handleDeleteClick = (postId: string) => {
        setPostToDelete(postId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (postToDelete) {
            deletePost(postToDelete, {
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setPostToDelete(null);
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setPostToDelete(null);
    };

    const handleFilterChange = (filter: "likes" | "comments", value: boolean) => {
        if (filter === "likes") {
            setFilterWithLikes(value);
        } else {
            setFilterWithComments(value);
        }
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterWithLikes(false);
        setFilterWithComments(false);
    };

    const hasActiveFilters = !!(searchTerm || filterWithLikes || filterWithComments);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Failed to load posts</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    My Drink Posts
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Post
                </Button>
            </Box>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search by drink name..."
                        />

                        <PostFilters
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            filterWithLikes={filterWithLikes}
                            filterWithComments={filterWithComments}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            hasActiveFilters={hasActiveFilters}
                        />
                    </Stack>
                </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {filteredAndSortedPosts.length} of {posts.length} posts
            </Typography>

            {filteredAndSortedPosts.length === 0 ? (
                <EmptyState hasPosts={posts.length > 0} hasFilters={hasActiveFilters} />
            ) : (
                <Grid container spacing={3}>
                    {filteredAndSortedPosts.map((post) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                            <PostCard
                                post={post}
                                onEdit={handleOpenDialog}
                                onDelete={handleDeleteClick}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <PostDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSubmit={onSubmit}
                post={editingPost}
                isSubmitting={isCreating || isUpdating}
                control={control}
                handleSubmit={handleSubmit}
                errors={errors}
                aiPrompt={aiPrompt}
                onAiPromptChange={setAiPrompt}
                onGenerateWithAI={handleGenerateWithAI}
                isGenerating={isGenerating}
                aiError={aiError}
                onAiErrorDismiss={() => setAiError(null)}
            />

            <DeleteConfirmDialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                isDeleting={isDeleting}
            />
        </Box>
    );
};

export default MyPostsPage;
