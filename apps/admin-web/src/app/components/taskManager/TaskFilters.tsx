// ============================================================================
// TASK FILTERS COMPONENT
// ============================================================================
// Provides filtering options for task list
// ============================================================================

import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import type { TaskStatus } from "../../mockDataProviders/mockTasks";
import { AVAILABLE_TARGETS } from "../../mockDataProviders/mockTasks";

interface TaskFiltersProps {
  searchQuery: string;
  statusFilter: TaskStatus | "ALL";
  targetFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "ALL") => void;
  onTargetChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export default function TaskFilters({
  searchQuery,
  statusFilter,
  targetFilter,
  onSearchChange,
  onStatusChange,
  onTargetChange,
  onClearFilters,
  resultCount,
}: TaskFiltersProps) {
  const hasActiveFilters = searchQuery || statusFilter !== "ALL" || targetFilter !== "ALL";

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
      }}
    >
      {/* Search */}
      <TextField
        size="small"
        placeholder="Search by title or description..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 280, flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Status Filter */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => onStatusChange(e.target.value as TaskStatus | "ALL")}
        >
          <MenuItem value="ALL">All Status</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="ONGOING">Ongoing</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
        </Select>
      </FormControl>

      {/* Target Filter */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Target Class</InputLabel>
        <Select
          value={targetFilter}
          label="Target Class"
          onChange={(e) => onTargetChange(e.target.value)}
        >
          <MenuItem value="ALL">All Classes</MenuItem>
          {AVAILABLE_TARGETS.map((target) => (
            <MenuItem key={target} value={target}>
              {target}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          size="small"
          startIcon={<FilterListOffIcon />}
          onClick={onClearFilters}
          sx={{ ml: "auto" }}
        >
          Clear Filters
        </Button>
      )}

      {/* Result Count */}
      <Box
        sx={{
          ml: hasActiveFilters ? 0 : "auto",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: "primary.main",
          fontWeight: 500,
          fontSize: "0.875rem",
        }}
      >
        {resultCount} task{resultCount !== 1 ? "s" : ""}
      </Box>
    </Box>
  );
}
