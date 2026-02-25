import { useState, useMemo } from "react";
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Grid,
} from "@mui/material";
import { PageStatus } from "../components/ui";
import { Add as AddIcon } from "@mui/icons-material";
import { useUser } from "../hooks/useUser";
import { usePosts } from "../hooks/usePosts";
import type { SortOption } from "../types/posts";
import type { Post } from "../services/posts";
import {
    PostCard,
    SearchBar,
    SortBySelect,
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

    const searchParams = useMemo(() => ({
        search: committedSearch || undefined,
        sort: sortBy !== "newest" ? sortBy : undefined,
    }), [committedSearch, sortBy]);

    const { posts, total, isLoading, isFetching, error, createPost, updatePost, deletePost, isCreating, isUpdating, isDeleting } = usePosts(user?._id || "", searchParams);

    const [openDialog, setOpenDialog] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    const handleSearch = (value: string) => {
        setCommittedSearch(value);
    };

    const handleOpenDialog = (post?: Post) => {
        setEditingPost(post ?? null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingPost(null);
    };

    const hasActiveFilters = !!committedSearch;

    return (
        <PageStatus isLoading={isLoading} error={error} errorMessage="Failed to load posts">
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
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                            <SearchBar
                                value={searchInput}
                                onChange={setSearchInput}
                                onSearch={handleSearch}
                                placeholder="Search for a drink..."
                            />
                        </Box>

                        <SortBySelect value={sortBy} onChange={setSortBy} />
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
                                onDelete={setPostToDelete}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <PostDialog
                open={openDialog}
                onClose={handleCloseDialog}
                post={editingPost}
                createPost={createPost}
                updatePost={updatePost}
                isCreating={isCreating}
                isUpdating={isUpdating}
            />

            <DeleteConfirmDialog
                postId={postToDelete}
                onClose={() => setPostToDelete(null)}
                deletePost={deletePost}
                isDeleting={isDeleting}
            />
        </Box>
        </PageStatus>
    );
};

export default MyPostsPage;
