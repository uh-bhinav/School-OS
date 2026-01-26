import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Chip,
  Tooltip,
  Button,
  LinearProgress,
} from "@mui/material";
import { Save, Edit, Visibility, CheckCircle, Warning } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useClassSubjectMapping, useUpdateSubjectMapping } from "@/app/services/classes.hooks";
import { MOCK_TEACHERS } from "@/app/mockDataProviders/mockTeachers";

interface ClassSubjectMappingTabProps {
  classId: number;
  grade?: number;
}

// Enhanced mapping data with CO status
interface EnhancedMapping {
  mapping_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  teacher_id: number | null;
  teacher_name: string | null;
  periods_per_week: number;
  // OBE Enhancement fields
  cos_defined: number;
  cos_approved: number;
  exam_ready: boolean;
}

export default function ClassSubjectMappingTab({ classId, grade = 10 }: ClassSubjectMappingTabProps) {
  const navigate = useNavigate();
  const { data: mappings, isLoading, error } = useClassSubjectMapping(classId);
  const updateMutation = useUpdateSubjectMapping();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  const handleEdit = (mappingId: number, currentTeacherId: number | null) => {
    setEditingId(mappingId);
    setSelectedTeacherId(currentTeacherId);
  };

  const handleSave = async (mappingId: number) => {
    if (selectedTeacherId) {
      try {
        await updateMutation.mutateAsync({ mappingId, teacherId: selectedTeacherId });
        setEditingId(null);
        setSelectedTeacherId(null);
      } catch (error) {
        console.error("Failed to update mapping:", error);
      }
    }
  };

  // Enhance mappings with mock CO data - in production this would come from API
  const enhancedMappings: EnhancedMapping[] = (mappings || []).map((mapping) => ({
    ...mapping,
    cos_defined: Math.floor(Math.random() * 6) + 3, // 3-8 COs
    cos_approved: Math.floor(Math.random() * 6) + 1, // 1-6 approved
    exam_ready: Math.random() > 0.3, // 70% are exam ready
  }));

  const getCOStatusChip = (defined: number, approved: number) => {
    const percentage = defined > 0 ? Math.round((approved / defined) * 100) : 0;

    if (percentage === 100) {
      return (
        <Chip
          icon={<CheckCircle />}
          label={`${approved}/${defined} COs`}
          size="small"
          color="success"
          variant="outlined"
        />
      );
    }
    if (percentage > 0) {
      return (
        <Tooltip title={`${percentage}% of COs approved`}>
          <Chip
            icon={<Warning />}
            label={`${approved}/${defined} COs`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Tooltip>
      );
    }
    return (
      <Chip
        label="No COs"
        size="small"
        color="default"
        variant="outlined"
      />
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load subject mappings: {error.message}</Alert>;
  }

  // Summary stats
  const totalSubjects = enhancedMappings.length;
  const subjectsWithAllCOsApproved = enhancedMappings.filter(
    (m) => m.cos_defined > 0 && m.cos_approved === m.cos_defined
  ).length;
  const examReadyCount = enhancedMappings.filter((m) => m.exam_ready).length;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">
          Subject-Teacher Mapping
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={`${subjectsWithAllCOsApproved}/${totalSubjects} CO Ready`}
            size="small"
            color={subjectsWithAllCOsApproved === totalSubjects ? "success" : "warning"}
          />
          <Chip
            label={`${examReadyCount}/${totalSubjects} Exam Ready`}
            size="small"
            color={examReadyCount === totalSubjects ? "success" : "info"}
          />
        </Box>
      </Box>

      {/* Progress indicator */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          CO Approval Progress for Grade {grade}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(subjectsWithAllCOsApproved / totalSubjects) * 100}
          sx={{ height: 8, borderRadius: 4 }}
          color={subjectsWithAllCOsApproved === totalSubjects ? "success" : "primary"}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Subject Code</TableCell>
              <TableCell>Assigned Teacher</TableCell>
              <TableCell>Periods/Week</TableCell>
              <TableCell>CO Status</TableCell>
              <TableCell>Exam Ready</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enhancedMappings.map((mapping) => (
              <TableRow key={mapping.mapping_id} hover>
                <TableCell>
                  <Typography fontWeight="medium">{mapping.subject_name}</Typography>
                </TableCell>
                <TableCell>{mapping.subject_code}</TableCell>
                <TableCell>
                  {editingId === mapping.mapping_id ? (
                    <FormControl size="small" fullWidth sx={{ minWidth: 200 }}>
                      <Select
                        value={selectedTeacherId || ""}
                        onChange={(e) => setSelectedTeacherId(e.target.value as number)}
                      >
                        {MOCK_TEACHERS.map((teacher) => (
                          <MenuItem key={teacher.teacher_id} value={teacher.teacher_id}>
                            {teacher.first_name} {teacher.last_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography>{mapping.teacher_name || "Not assigned"}</Typography>
                  )}
                </TableCell>
                <TableCell>{mapping.periods_per_week}</TableCell>
                <TableCell>
                  {getCOStatusChip(mapping.cos_defined, mapping.cos_approved)}
                </TableCell>
                <TableCell>
                  {mapping.exam_ready ? (
                    <Chip label="Ready" size="small" color="success" />
                  ) : (
                    <Chip label="Pending" size="small" color="default" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    {editingId === mapping.mapping_id ? (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleSave(mapping.mapping_id)}
                        disabled={updateMutation.isPending}
                      >
                        <Save />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(mapping.mapping_id, mapping.teacher_id)}
                      >
                        <Edit />
                      </IconButton>
                    )}
                    <Tooltip title="View Subject Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/academics/subjects/${mapping.subject_id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action buttons */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/academics/subjects")}
        >
          Manage All Subjects
        </Button>
      </Box>
    </Box>
  );
}
