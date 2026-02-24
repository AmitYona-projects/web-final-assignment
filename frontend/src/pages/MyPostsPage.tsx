import { useState, useMemo, useEffect } from "react";
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
import { config } from "../config";
import { postSchema, type PostFormData, type SortOption, type DrinkCategory } from "../types/posts";
import type { Post } from "../services/posts";
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

    const [searchInput, setSearchInput] = useState("");
    const [committedSearch, setCommittedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterWithLikes, setFilterWithLikes] = useState(false);
    const [filterWithComments, setFilterWithComments] = useState(false);
    const [filterCategories, setFilterCategories] = useState<DrinkCategory[]>([]);
    const [aiPrompt, setAiSearchPrompt] = useState<string | undefined>(undefined);
    const [isAiSearching, setIsAiSearching] = useState(false);

    const searchParams = useMemo(() => ({
        search: committedSearch || undefined,
        sort: sortBy !== "newest" ? sortBy : undefined,
        hasLikes: filterWithLikes || undefined,
        hasComments: filterWithComments || undefined,
        categories: filterCategories.length > 0 ? filterCategories : undefined,
        aiPrompt,
    }), [committedSearch, sortBy, filterWithLikes, filterWithComments, filterCategories, aiPrompt]);

    const { posts, total, aiCategories, isLoading, isFetching, error, createPost, updatePost, deletePost, isCreating, isUpdating, isDeleting } = usePosts(user?._id || "", searchParams);

    useEffect(() => {
        if (aiCategories && aiCategories.length > 0) {
            setFilterCategories(aiCategories);
            setIsAiSearching(false);
            setAiSearchPrompt(undefined);
        }
    }, [aiCategories]);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [aiFormPrompt, setAiFormPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

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
            categories: [],
        },
    });

    const handleSearch = (value: string) => {
        setCommittedSearch(value);
    };

    const handleOpenDialog = (post?: Post) => {
        if (post) {
            setEditingPost(post);
            reset({
                drinkName: post.drinkName,
                instructions: post.instructions,
                categories: post.categories || [],
            });
            setImagePreview(post.drinkImage ? `${config.uploadFolderUrl}${post.drinkImage}` : undefined);
        } else {
            setEditingPost(null);
            reset({
                drinkName: "",
                instructions: "",
                categories: [],
            });
            setImagePreview(undefined);
        }
        setImageFile(null);
        setAiFormPrompt("");
        setAiError(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingPost(null);
        setImageFile(null);
        setImagePreview(undefined);
        setAiFormPrompt("");
        setAiError(null);
        reset();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGenerateWithAI = async () => {
        if (!aiFormPrompt.trim()) {
            setAiError("Please enter a description for the cocktail you want to create");
            return;
        }

        setIsGenerating(true);
        setAiError(null);

        try {
            const recipe = await geminiService.generateCocktailRecipe(aiFormPrompt);

            reset({
                drinkName: recipe.drinkName,
                instructions: recipe.instructions,
                categories: recipe.categories || [],
            });

            setAiFormPrompt("");
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
                {
                    id: editingPost._id,
                    data: {
                        ...data,
                        ...(imageFile && { drinkImage: imageFile }),
                    },
                },
                {
                    onSuccess: () => {
                        handleCloseDialog();
                    },
                }
            );
        } else {
            createPost(
                {
                    ...data,
                    ...(imageFile && { drinkImage: imageFile }),
                },
                {
                    onSuccess: () => {
                        handleCloseDialog();
                    },
                }
            );
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

    const handleCategoryToggle = (category: DrinkCategory) => {
        setFilterCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    const handleAiCategorySearch = (prompt: string) => {
        setIsAiSearching(true);
        setAiSearchPrompt(prompt);
    };

    const handleClearFilters = () => {
        setSearchInput("");
        setCommittedSearch("");
        setFilterWithLikes(false);
        setFilterWithComments(false);
        setFilterCategories([]);
        setAiSearchPrompt(undefined);
    };

    const hasActiveFilters = !!(committedSearch || filterWithLikes || filterWithComments || filterCategories.length > 0);

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
                            value={searchInput}
                            onChange={setSearchInput}
                            onSearch={handleSearch}
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
                            filterCategories={filterCategories}
                            onCategoryToggle={handleCategoryToggle}
                            onAiCategorySearch={handleAiCategorySearch}
                            isAiSearching={isAiSearching}
                        />
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Showing {posts.length} of {total} posts
                </Typography>
                {isFetching && <CircularProgress size={16} />}
            </Box>

            {posts.length === 0 ? (
                <EmptyState hasPosts={total > 0} hasFilters={hasActiveFilters} />
            ) : (
                <Grid container spacing={3}>
                    {posts.map((post) => (
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
                aiPrompt={aiFormPrompt}
                onAiPromptChange={setAiFormPrompt}
                onGenerateWithAI={handleGenerateWithAI}
                isGenerating={isGenerating}
                aiError={aiError}
                onAiErrorDismiss={() => setAiError(null)}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
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
