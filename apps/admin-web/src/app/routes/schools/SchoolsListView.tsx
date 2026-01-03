// ============================================================================
// SCHOOLS LIST VIEW - Table Display for All Schools
// ============================================================================
// Read-only table with:
// - Columns: School Name, Region, Students, Attendance %, Fee Collection %, Status
// - Column sorting
// - Row hover highlight
// - Row click → navigates to /schools/{school-id}
// ============================================================================

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  Typography,
  alpha,
} from "@mui/material";
import { useThemeMode } from "../../providers/ThemeProvider";
import type { School } from "../../mockDataProviders/mockSuperAdmin";

interface SchoolsListViewProps {
  schools: School[];
}

type SortDirection = "asc" | "desc";
type SortKey = "name" | "region" | "totalStudents" | "avgAttendance" | "feeCollectionRate" | "status";

// Status priority for sorting (critical > attention > healthy)
const statusPriority: Record<School["status"], number> = {
  critical: 0,
  attention: 1,
  healthy: 2,
};

export default function SchoolsListView({ schools }: SchoolsListViewProps) {
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Sort schools based on current sort key and direction
  const sortedSchools = useMemo(() => {
    return [...schools].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "region":
          comparison = a.region.localeCompare(b.region);
          break;
        case "totalStudents":
          comparison = a.totalStudents - b.totalStudents;
          break;
        case "avgAttendance":
          comparison = a.avgAttendance - b.avgAttendance;
          break;
        case "feeCollectionRate":
          comparison = a.feeCollectionRate - b.feeCollectionRate;
          break;
        case "status":
          comparison = statusPriority[a.status] - statusPriority[b.status];
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [schools, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (schoolId: number) => {
    navigate(`/group-overview/schools/${schoolId}`);
  };

  // Get status chip color and label
  const getStatusChip = (status: School["status"]) => {
    const config = {
      healthy: { color: "success" as const, label: "Healthy" },
      attention: { color: "warning" as const, label: "Watchlist" },
      critical: { color: "error" as const, label: "Needs Attention" },
    };
    const { color, label } = config[status];
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{
          fontWeight: 500,
          minWidth: 100,
        }}
      />
    );
  };

  // Column definitions
  const columns: { key: SortKey; label: string; align?: "left" | "right" | "center"; width?: number }[] = [
    { key: "name", label: "School Name", align: "left" },
    { key: "region", label: "Region", align: "left", width: 100 },
    { key: "totalStudents", label: "Students", align: "right", width: 100 },
    { key: "avgAttendance", label: "Attendance %", align: "right", width: 120 },
    { key: "feeCollectionRate", label: "Fee Collection %", align: "right", width: 140 },
    { key: "status", label: "Status", align: "center", width: 140 },
  ];

  return (
    <Paper
      sx={{
        flex: 1,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.6) : "#fff",
        boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <TableContainer sx={{ height: "100%" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align}
                  sx={{
                    backgroundColor: mode === "dark" ? "#1a1a2e" : "#f5f5f5",
                    fontWeight: 600,
                    width: column.width,
                    borderBottom: mode === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <TableSortLabel
                    active={sortKey === column.key}
                    direction={sortKey === column.key ? sortDirection : "asc"}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSchools.map((school) => (
              <TableRow
                key={school.id}
                onClick={() => handleRowClick(school.id)}
                sx={{
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: mode === "dark" ? alpha("#1976d2", 0.15) : alpha("#1976d2", 0.06),
                  },
                  "& td": {
                    borderBottom: mode === "dark" ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {school.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {school.city}, {school.state}
                  </Typography>
                </TableCell>
                <TableCell>{school.region}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}>
                    {school.totalStudents.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      color:
                        school.avgAttendance >= 90
                          ? mode === "dark"
                            ? "#66bb6a"
                            : "#2e7d32"
                          : school.avgAttendance >= 80
                            ? mode === "dark"
                              ? "#ffb74d"
                              : "#f57c00"
                            : mode === "dark"
                              ? "#ef5350"
                              : "#c62828",
                    }}
                  >
                    {school.avgAttendance.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      color:
                        school.feeCollectionRate >= 85
                          ? mode === "dark"
                            ? "#66bb6a"
                            : "#2e7d32"
                          : school.feeCollectionRate >= 70
                            ? mode === "dark"
                              ? "#ffb74d"
                              : "#f57c00"
                            : mode === "dark"
                              ? "#ef5350"
                              : "#c62828",
                    }}
                  >
                    {school.feeCollectionRate}%
                  </Typography>
                </TableCell>
                <TableCell align="center">{getStatusChip(school.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
