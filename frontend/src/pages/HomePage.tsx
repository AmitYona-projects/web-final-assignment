/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    Grid,
} from "@mui/material";
import { PageStatus } from "../components/ui";
import { useUser } from "../hooks/useUser";
import { useAllPosts } from "../hooks/useAllPosts";
import type { SortOption, DrinkCategory } from "../types/posts";
import {
    FeedPostCard,
    SearchBar,
    PostFilters,
    EmptyState,
} from "../components/posts";
import type React from "react";

const HomePage: React.FC = () => {
    const { user } = useUser();

    const [searchInput, setSearchInput] = useState("");
    const [committedSearch, setCommittedSearch] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [filterWithLikes, setFilterWithLikes] = useState(false);
    const [filterWithComments, setFilterWithComments] = useState(false);
    const [filterCategories, setFilterCategories] = useState<DrinkCategory[]>([]);
    const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);
    const [isAiSearching, setIsAiSearching] = useState(false);

    const searchParams = useMemo(() => ({
        search: committedSearch || undefined,
        sort: sortBy !== "newest" ? sortBy : undefined,
        hasLikes: filterWithLikes || undefined,
        hasComments: filterWithComments || undefined,
        categories: filterCategories.length > 0 ? filterCategories : undefined,
        aiPrompt,
    }), [committedSearch, sortBy, filterWithLikes, filterWithComments, filterCategories, aiPrompt]);

    const {
        posts,
        total,
        aiCategories,
        isLoading,
        isFetching,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        toggleLike,
    } = useAllPosts(searchParams);

    useEffect(() => {
        if (aiCategories && aiCategories.length > 0) {
            setFilterCategories(aiCategories);
            setIsAiSearching(false);
            setAiPrompt(undefined);
        }
    }, [aiCategories]);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observerRef.current) observerRef.current.disconnect();
            if (!node) return;

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            });
            observerRef.current.observe(node);
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    const handleSearch = (value: string) => {
        setCommittedSearch(value);
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
        setAiPrompt(prompt);
    };

    const handleClearFilters = () => {
        setSearchInput("");
        setCommittedSearch("");
        setFilterWithLikes(false);
        setFilterWithComments(false);
        setFilterCategories([]);
        setAiPrompt(undefined);
    };

    const hasActiveFilters = !!(committedSearch || filterWithLikes || filterWithComments || filterCategories.length > 0);

    return (
        <PageStatus isLoading={isLoading} error={error} errorMessage="Failed to load posts">
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
                {isFetching && !isFetchingNextPage && <CircularProgress size={16} />}
            </Box>

            {posts.length === 0 ? (
                <EmptyState hasPosts={total > 0} hasFilters={hasActiveFilters} />
            ) : (
                <Grid container spacing={3} alignItems="flex-start">
                    {posts.map((post) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={post._id}>
                            <FeedPostCard
                                post={post}
                                currentUserId={user?._id || ""}
                                onToggleLike={toggleLike}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <Box ref={sentinelRef} sx={{ py: 2, display: "flex", justifyContent: "center" }}>
                {isFetchingNextPage && <CircularProgress size={32} />}
            </Box>
        </Box>
        </PageStatus>
    );
};

export default HomePage;
