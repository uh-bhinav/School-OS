import { Box, ToggleButton, ToggleButtonGroup, TextField, MenuItem, FormControlLabel, Checkbox, alpha, InputAdornment, Paper, Chip } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SearchIcon from "@mui/icons-material/Search";
import { useTimetableViewStore, type ViewType } from "../../stores/useTimetableViewStore";

interface ViewSelectorProps {
  classes: Array<{ id: string; name: string }>;
  sections: string[];
  teachers: Array<{ id: string; name: string; subject?: string }>;
  resources: Array<{ id: string; name: string; type?: string }>;
  onEntityChange?: () => void;
}

export default function ViewSelector({
  classes,
  sections,
  teachers,
  resources,
  onEntityChange,
}: ViewSelectorProps) {
  const {
    currentView,
    setCurrentView,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    selectedTeacher,
    setSelectedTeacher,
    selectedResource,
    setSelectedResource,
    searchQuery,
    setSearchQuery,
    showConflictsOnly,
    toggleShowConflictsOnly,
    highlightFreePeriods,
    toggleHighlightFreePeriods,
    showRoomNumbers,
    toggleShowRoomNumbers,
  } = useTimetableViewStore();

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView !== null) {
      setCurrentView(newView);
      onEntityChange?.();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* View Type Tabs */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={currentView}
          exclusive
          onChange={handleViewChange}
          aria-label="timetable view"
          size="small"
          sx={{
            bgcolor: "background.paper",
            "& .MuiToggleButton-root": {
              px: 2.5,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
            },
          }}
        >
          <ToggleButton value="class" aria-label="class view">
            <GroupsIcon sx={{ mr: 1, fontSize: 20 }} />
            Class View
          </ToggleButton>
          <ToggleButton value="teacher" aria-label="teacher view">
            <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
            Teacher View
          </ToggleButton>
          <ToggleButton value="resource" aria-label="resource view">
            <MeetingRoomIcon sx={{ mr: 1, fontSize: 20 }} />
            Resource View
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters Row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", mb: 2 }}>
        {/* Class View Filters */}
        {currentView === "class" && (
          <>
            <TextField
              select
              label="Class"
              value={selectedClass || ""}
              onChange={(e) => {
                setSelectedClass(e.target.value || null);
                onEntityChange?.();
              }}
              sx={{ minWidth: 160 }}
              size="small"
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Section"
              value={selectedSection || ""}
              onChange={(e) => {
                setSelectedSection(e.target.value || null);
                onEntityChange?.();
              }}
              sx={{ minWidth: 120 }}
              size="small"
            >
              <MenuItem value="">All Sections</MenuItem>
              {sections.map((s) => (
                <MenuItem key={s} value={s}>
                  Section {s}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}

        {/* Teacher View Filter */}
        {currentView === "teacher" && (
          <TextField
            select
            label="Teacher"
            value={selectedTeacher || ""}
            onChange={(e) => {
              setSelectedTeacher(e.target.value || null);
              onEntityChange?.();
            }}
            sx={{ minWidth: 250 }}
            size="small"
          >
            <MenuItem value="">All Teachers</MenuItem>
            {teachers.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
                {t.subject && (
                  <Chip
                    label={t.subject}
                    size="small"
                    sx={{ ml: 1, height: 18, fontSize: "0.7rem" }}
                  />
                )}
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* Resource View Filter */}
        {currentView === "resource" && (
          <TextField
            select
            label="Resource"
            value={selectedResource || ""}
            onChange={(e) => {
              setSelectedResource(e.target.value || null);
              onEntityChange?.();
            }}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All Resources</MenuItem>
            {resources.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
                {r.type && (
                  <Chip
                    label={r.type}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1, height: 18, fontSize: "0.7rem" }}
                  />
                )}
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* Search Input */}
        <TextField
          placeholder="Search by subject, teacher, or room..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ minWidth: 280, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Toggle Filters */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showConflictsOnly}
              onChange={toggleShowConflictsOnly}
              size="small"
            />
          }
          label={
            <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 500, color: "text.secondary" }}>
              Show conflicts only
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={highlightFreePeriods}
              onChange={toggleHighlightFreePeriods}
              size="small"
            />
          }
          label={
            <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 500, color: "text.secondary" }}>
              Highlight free periods
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showRoomNumbers}
              onChange={toggleShowRoomNumbers}
              size="small"
            />
          }
          label={
            <Box component="span" sx={{ fontSize: "0.875rem", fontWeight: 500, color: "text.secondary" }}>
              Show room numbers
            </Box>
          }
        />
      </Box>
    </Paper>
  );
}
