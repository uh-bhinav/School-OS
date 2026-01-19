// components/attendance/AttendanceTable.tsx
import { useState } from "react";
import { DataGrid, GridColDef, GridToolbar, type GridRowSelectionModel } from "@mui/x-data-grid";
import { IconButton, Box, Button, Stack, Chip, Menu, MenuItem, Skeleton, Typography, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

interface AttendanceRow {
  id: number;
  student_id: number;
  student_name: string;
  status: string;
  remarks?: string;
}

const getStatusChip = (status: string) => {
  const configs = {
    PRESENT: { color: "success" as const, icon: <CheckCircleIcon /> },
    ABSENT: { color: "error" as const, icon: <CancelIcon /> },
    LATE: { color: "warning" as const, icon: <AccessTimeIcon /> },
    EXCUSED: { color: "info" as const, icon: <CheckCircleIcon /> },
  };
  const config = configs[status as keyof typeof configs] || { color: "default" as const, icon: null };
  return <Chip label={status} color={config.color} size="small" icon={config.icon} sx={{ fontWeight: 600 }} />;
};

export default function AttendanceTable(props: {
  rows: AttendanceRow[];
  onEdit: (row: AttendanceRow) => void;
  onHistory: (student_id: number) => void;
  onBulkMark?: (ids: number[], status: string) => void;
  onExport?: () => void;
  loading?: boolean;
}) {
  const { rows, onEdit, onHistory, onBulkMark, onExport, loading } = props;
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  const handleBulkAction = (status: string) => {
    if (onBulkMark && selectionModel.ids.size > 0) {
      onBulkMark(Array.from(selectionModel.ids) as number[], status);
      setSelectionModel({ type: 'include', ids: new Set() });
    }
    setBulkMenuAnchor(null);
  };

  const columns: GridColDef[] = [
    { field: "student_name", headerName: "Student", flex: 1, minWidth: 200, headerClassName: "table-header" },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      headerClassName: "table-header",
      renderCell: (params) => getStatusChip(params.value as string),
    },
    { field: "remarks", headerName: "Remarks", flex: 1, minWidth: 150, headerClassName: "table-header" },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      headerClassName: "table-header",
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => onEdit(params.row as AttendanceRow)} sx={{ color: "primary.main" }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onHistory((params.row as AttendanceRow).student_id)} sx={{ color: "info.main" }}>
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1.5}>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: 2 }} animation="wave" />
          ))}
        </Stack>
      </Paper>
    );
  }

  if (rows.length === 0) {
    return (
      <Paper
        sx={{
          textAlign: "center",
          py: 8,
          px: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(11, 95, 90, 0.03) 0%, rgba(11, 95, 90, 0.08) 100%)",
          border: "2px dashed",
          borderColor: "divider",
        }}
      >
        <PeopleOutlineIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" gutterBottom fontWeight={600}>
          No attendance records found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or start marking attendance for this class.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Box>
          {selectionModel.ids.size > 0 && (
            <>
              <Button
                variant="contained"
                onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                sx={{ mr: 1, borderRadius: 2, textTransform: "none" }}
              >
                Bulk Actions ({selectionModel.ids.size} selected)
              </Button>
              <Menu
                anchorEl={bulkMenuAnchor}
                open={Boolean(bulkMenuAnchor)}
                onClose={() => setBulkMenuAnchor(null)}
                PaperProps={{
                  sx: { borderRadius: 2, mt: 1 },
                }}
              >
                <MenuItem onClick={() => handleBulkAction("PRESENT")}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: "success.main" }} />
                  Mark as Present
                </MenuItem>
                <MenuItem onClick={() => handleBulkAction("ABSENT")}>
                  <CancelIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
                  Mark as Absent
                </MenuItem>
                <MenuItem onClick={() => handleBulkAction("LATE")}>
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: "warning.main" }} />
                  Mark as Late
                </MenuItem>
                <MenuItem onClick={() => handleBulkAction("EXCUSED")}>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: "info.main" }} />
                  Mark as Excused
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
        {onExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Export CSV
          </Button>
        )}
      </Stack>

      <Box
        sx={{
          height: 580,
          width: "100%",
          "& .table-header": {
            bgcolor: "action.hover",
            fontWeight: 700,
            fontSize: "0.875rem",
          },
          "& .MuiDataGrid-row": {
            transition: "all 0.2s ease",
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: "rgba(11, 95, 90, 0.04)",
            transform: "scale(1.001)",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={setSelectionModel}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            "& .MuiDataGrid-cell": { borderColor: "divider" },
            "& .MuiDataGrid-columnHeaders": { borderColor: "divider" },
          }}
        />
      </Box>
    </Paper>
  );
}
