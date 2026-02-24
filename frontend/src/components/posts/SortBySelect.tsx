import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type React from "react";
import type { SortOption } from "../../types/posts";

export interface SortBySelectProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
    minWidth?: number;
}

const SortBySelect: React.FC<SortBySelectProps> = ({ value, onChange, minWidth = 180 }) => (
    <FormControl sx={{ minWidth }}>
        <InputLabel>Sort By</InputLabel>
        <Select
            value={value}
            label="Sort By"
            onChange={(e) => onChange(e.target.value as SortOption)}
        >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="most-liked">Most Liked</MenuItem>
            <MenuItem value="most-commented">Most Commented</MenuItem>
        </Select>
    </FormControl>
);

export default SortBySelect;
