// components/attendance/FiltersBar.tsx
import { useState } from "react";
import { Box, TextField, MenuItem, Button, Chip, Stack, ToggleButtonGroup, ToggleButton, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export type Filters = {
  academic_year_id?: number;
  class_id?: number;
  section_id?: number;
  date: string;
  date_from?: string;
  date_to?: string;
  month?: string;
  filter_mode: "date" | "month" | "range";
};

/** Get today's date as YYYY-MM-DD */
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** Validate a date string, returning empty string if invalid or in the future */
function validateDate(value: string): string {
  if (!value) return "";
  const today = getTodayStr();
  // Check basic format
  const parts = value.split("-");
  if (parts.length !== 3) return "";
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  // Reject 0 or invalid values
  if (!year || year < 2000 || year > 2099) return "";
  if (!month || month < 1 || month > 12) return "";
  if (!day || day < 1 || day > 31) return "";
  // Reject future dates
  if (value > today) return "";
  // Final check with Date object
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return "";
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return "";
  return value;
}

export default function FiltersBar(props: {
  filters: Filters;
  setFilters: (f: Partial<Filters>) => void;
  onRefresh: () => void;
  academicYears?: Array<{ id: number; name: string }>;
  classes: Array<{ id: number; name: string }>;
  sections?: Array<{ id: number; name: string }>;
}) {
  const { filters, setFilters, onRefresh, academicYears, classes, sections } = props;
  const [dateError, setDateError] = useState("");

  const activeFilterCount = [
    filters.academic_year_id,
    filters.class_id,
    filters.section_id,
  ].filter(Boolean).length;

  const today = getTodayStr();
  const currentMonth = today.slice(0, 7); // YYYY-MM

  const handleDateChange = (value: string) => {
    setDateError("");
    if (!value) {
      setFilters({ date: today });
      return;
    }
    const validated = validateDate(value);
    if (!validated) {
      setDateError("Invalid or future date. Please enter a valid past/present date.");
      return;
    }
    setFilters({ date: validated });
  };

  const handleFromDateChange = (value: string) => {
    setDateError("");
    if (!value) return;
    const validated = validateDate(value);
    if (!validated) {
      setDateError("Invalid start date.");
      return;
    }
    setFilters({ date_from: validated });
  };

  const handleToDateChange = (value: string) => {
    setDateError("");
    if (!value) return;
    const validated = validateDate(value);
    if (!validated) {
      setDateError("Invalid end date.");
      return;
    }
    if (filters.date_from && validated < filters.date_from) {
      setDateError("End date must be after start date.");
      return;
    }
    setFilters({ date_to: validated });
  };

  const handleMonthChange = (value: string) => {
    setDateError("");
    if (!value) return;
    // Validate month format YYYY-MM
    const parts = value.split("-");
    if (parts.length !== 2) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (!year || year < 2000 || year > 2099) { setDateError("Invalid year."); return; }
    if (!month || month < 1 || month > 12) { setDateError("Invalid month."); return; }
    if (value > currentMonth) { setDateError("Cannot select future months."); return; }
    setFilters({ month: value });
  };

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
      <Stack spacing={2}>
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
        </Stack>

        {/* Filter Mode Toggle */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <ToggleButtonGroup
            value={filters.filter_mode}
            exclusive
            onChange={(_, mode) => { if (mode) setFilters({ filter_mode: mode }); }}
            size="small"
          >
            <ToggleButton value="date">
              <CalendarTodayIcon sx={{ mr: 0.5, fontSize: 18 }} /> Date
            </ToggleButton>
            <ToggleButton value="month">
              <CalendarMonthIcon sx={{ mr: 0.5, fontSize: 18 }} /> Month
            </ToggleButton>
            <ToggleButton value="range">
              <DateRangeIcon sx={{ mr: 0.5, fontSize: 18 }} /> Date Range
            </ToggleButton>
          </ToggleButtonGroup>

          {filters.filter_mode === "date" && (
            <TextField
              type="date"
              label="Date"
              value={filters.date}
              size="small"
              sx={{ minWidth: 160 }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
              onChange={(e) => handleDateChange(e.target.value)}
              error={!!dateError}
            />
          )}

          {filters.filter_mode === "month" && (
            <TextField
              type="month"
              label="Month"
              value={filters.month || currentMonth}
              size="small"
              sx={{ minWidth: 180 }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: currentMonth }}
              onChange={(e) => handleMonthChange(e.target.value)}
              error={!!dateError}
            />
          )}

          {filters.filter_mode === "range" && (
            <>
              <TextField
                type="date"
                label="From"
                value={filters.date_from || ""}
                size="small"
                sx={{ minWidth: 160 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: today }}
                onChange={(e) => handleFromDateChange(e.target.value)}
                error={!!dateError}
              />
              <TextField
                type="date"
                label="To"
                value={filters.date_to || ""}
                size="small"
                sx={{ minWidth: 160 }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: today, min: filters.date_from || undefined }}
                onChange={(e) => handleToDateChange(e.target.value)}
                error={!!dateError}
              />
            </>
          )}

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

        {dateError && (
          <Typography variant="caption" color="error" sx={{ mt: -1 }}>
            ⚠ {dateError}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
