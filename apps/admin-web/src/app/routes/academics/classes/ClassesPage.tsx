import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search, Add, Visibility } from "@mui/icons-material";
import { useClasses, useClassKPI } from "@/app/services/classes.hooks";
import AssignClassTeacherDialog from "./components/AssignClassTeacherDialog";

export default function ClassesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const { data: classes, isLoading, error } = useClasses(1);
  const { data: kpi } = useClassKPI(1);

  const handleAssignTeacher = (classId: number) => {
    setSelectedClassId(classId);
    setAssignDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAssignDialogOpen(false);
    setSelectedClassId(null);
  };

  const filteredClasses = classes?.filter(
    (cls) =>
      cls.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.class_teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load classes: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Classes
        </Typography>
        <Button variant="contained" startIcon={<Add />} color="primary" disabled>
          New Class
        </Button>
      </Box>

      {/* KPI Cards */}
      {kpi && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Classes
              </Typography>
              <Typography variant="h4">{kpi.total_classes}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Classes
              </Typography>
              <Typography variant="h4">{kpi.active_classes}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                With Class Teacher
              </Typography>
              <Typography variant="h4">{kpi.classes_with_teacher}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">{kpi.total_students}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by class name, section, or teacher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Classes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Class Teacher</TableCell>
              <TableCell>Total Students</TableCell>
              <TableCell>Avg Performance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClasses?.map((cls) => (
              <TableRow
                key={cls.class_id}
                hover
                onClick={() => navigate(`/academics/classes/${cls.class_id}`)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Typography fontWeight="medium">{cls.class_name}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={cls.section} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  {cls.class_teacher_name ? (
                    <Typography>{cls.class_teacher_name}</Typography>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignTeacher(cls.class_id);
                      }}
                    >
                      Assign Teacher
                    </Button>
                  )}
                </TableCell>
                <TableCell>{cls.total_students}</TableCell>
                <TableCell>
                  <Chip
                    label={`${cls.average_performance}%`}
                    size="small"
                    color={cls.average_performance >= 75 ? "success" : "warning"}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={cls.is_active ? "Active" : "Inactive"}
                    size="small"
                    color={cls.is_active ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/academics/classes/${cls.class_id}`);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredClasses?.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">
            No classes found matching "{searchQuery}"
          </Typography>
        </Box>
      )}

      {/* Assign Teacher Dialog */}
      {selectedClassId && (
        <AssignClassTeacherDialog
          open={assignDialogOpen}
          classId={selectedClassId}
          onClose={handleCloseDialog}
        />
      )}
    </Box>
  );
}
