import { useState, useMemo } from "react";
import {
    Box,
    Typography,
    Alert,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Grid,
} from "@mui/material";
import { useUser } from "../hooks/useUser";
import { useAllPosts } from "../hooks/useAllPosts";
import type { SortOption } from "../types/posts";
import {
    FeedPostCard,
    SearchBar,
    PostFilters,
    EmptyState,
} from "../components/posts";
import type React from "react";

const HomePage: React.FC = () => {
    const { user } = useUser();
    const { posts, isLoading, error, toggleLike, addComment, deleteComment } = useAllPosts();

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterWithLikes, setFilterWithLikes] = useState(false);
    const [filterWithComments, setFilterWithComments] = useState(false);

    const filteredAndSortedPosts = useMemo(() => {
        let filtered = [...posts];

        if (searchTerm) {
            filtered = filtered.filter((post) =>
                post.drinkName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterWithLikes) {
            filtered = filtered.filter((post) => post.likes.length > 0);
        }

        if (filterWithComments) {
            filtered = filtered.filter((post) => post.comments.length > 0);
        }

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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Cocktail Feed
                </Typography>
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
                <Grid container spacing={3} alignItems="flex-start">
                    {filteredAndSortedPosts.map((post) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={post._id}>
                            <FeedPostCard
                                post={post}
                                currentUserId={user?._id || ""}
                                onToggleLike={toggleLike}
                                onAddComment={(postId, commentText) =>
                                    addComment({ postId, commentText })
                                }
                                onDeleteComment={(postId, commentId) =>
                                    deleteComment({ postId, commentId })
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default HomePage;
