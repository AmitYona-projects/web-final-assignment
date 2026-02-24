import { Paper, InputBase, IconButton } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import type React from "react";

export interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch, placeholder = "Search..." }) => {
    const handleSearch = () => {
        onSearch(value.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <Paper
            component="form"
            sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                boxShadow: 1,
            }}
            onSubmit={(e) => e.preventDefault()}
        >
            <IconButton sx={{ p: "10px" }} aria-label="search" onClick={handleSearch}>
                <SearchIcon />
            </IconButton>
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                inputProps={{ "aria-label": "search" }}
            />
        </Paper>
    );
};

export default SearchBar;
