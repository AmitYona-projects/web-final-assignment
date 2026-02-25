import { useState } from "react";
import { InputBase, IconButton, Box, Tooltip } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import type React from "react";

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch, placeholder = "Search..." }) => {
    const [focused, setFocused] = useState(false);

    const handleSearch = () => {
        onSearch(value.trim());
    };

    const handleClear = () => {
        onChange("");
        onSearch("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
        if (e.key === "Escape") {
            handleClear();
        }
    };

    return (
        <Box
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
                display: "flex",
                alignItems: "center",
                height: 44,
                borderRadius: "22px",
                border: "1.5px solid",
                borderColor: focused ? "primary.main" : "divider",
                bgcolor: "background.paper",
                px: 1,
                gap: 0.5,
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: focused ? "0 0 0 3px rgba(25, 118, 210, 0.12)" : "none",
                "&:hover": {
                    borderColor: focused ? "primary.main" : "text.secondary",
                },
            }}
        >
            <Tooltip title="Search">
                <IconButton
                    size="small"
                    aria-label="search"
                    onClick={handleSearch}
                    sx={{ color: focused ? "primary.main" : "text.secondary", transition: "color 0.2s" }}
                >
                    <SearchIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <InputBase
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                inputProps={{ "aria-label": "search" }}
                sx={{
                    flex: 1,
                    fontSize: "0.9rem",
                    "& input::placeholder": { color: "text.disabled", opacity: 1 },
                }}
            />

            {value && (
                <Tooltip title="Clear">
                    <IconButton
                        size="small"
                        aria-label="clear search"
                        onClick={handleClear}
                        sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default SearchBar;
