// components/attendance/FiltersBar.tsx
import { Box, TextField, MenuItem, Button, Chip, Stack } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";

export type Filters = {
  academic_year_id?: number;
  class_id?: number;
  section_id?: number;
  date: string;
};

export default function FiltersBar(props: {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  onRefresh: () => void;
  academicYears?: Array<{ id: number; name: string }>;
  classes: Array<{ id: number; name: string }>;
  sections?: Array<{ id: number; name: string }>;
}) {
  const { filters, setFilters, onRefresh, academicYears, classes, sections } = props;

  const activeFilterCount = [
    filters.academic_year_id,
    filters.class_id,
    filters.section_id,
  ].filter(Boolean).length;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
        transition: "box-shadow 0.3s ease",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon color="action" />
          <Chip
            label={`${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active`}
            size="small"
            color={activeFilterCount > 0 ? "primary" : "default"}
            variant={activeFilterCount > 0 ? "filled" : "outlined"}
          />
        </Box>

        {academicYears && academicYears.length > 0 && (
          <TextField
            select
            label="Academic Year"
            value={filters.academic_year_id ?? ""}
            sx={{ minWidth: 180 }}
            size="small"
            onChange={(e) => setFilters({ academic_year_id: Number(e.target.value) || undefined })}
          >
            <MenuItem value="">All Years</MenuItem>
            {academicYears.map((ay) => (
              <MenuItem key={ay.id} value={ay.id}>
                {ay.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          select
          label="Class"
          value={filters.class_id ?? ""}
          sx={{ minWidth: 180 }}
          size="small"
          onChange={(e) => setFilters({ class_id: Number(e.target.value) || undefined })}
        >
          <MenuItem value="">All Classes</MenuItem>
          {classes.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        {sections && sections.length > 0 && (
          <TextField
            select
            label="Section"
            value={filters.section_id ?? ""}
            sx={{ minWidth: 140 }}
            size="small"
            onChange={(e) => setFilters({ section_id: Number(e.target.value) || undefined })}
          >
            <MenuItem value="">All Sections</MenuItem>
            {sections.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          type="date"
          label="Date"
          value={filters.date}
          size="small"
          sx={{ minWidth: 160 }}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setFilters({ date: e.target.value })}
        />

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
            boxShadow: 2,
            "&:hover": { boxShadow: 4 },
          }}
        >
          Apply
        </Button>
      </Stack>
    </Box>
  );
}
