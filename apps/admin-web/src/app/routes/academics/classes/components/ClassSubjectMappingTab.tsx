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
} from "@mui/material";
import { Save, Edit } from "@mui/icons-material";
import { useClassSubjectMapping, useUpdateSubjectMapping } from "@/app/services/classes.hooks";
import { MOCK_TEACHERS } from "@/app/mockDataProviders/mockTeachers";

interface ClassSubjectMappingTabProps {
  classId: number;
}

export default function ClassSubjectMappingTab({ classId }: ClassSubjectMappingTabProps) {
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Subject-Teacher Mapping
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Subject Code</TableCell>
              <TableCell>Assigned Teacher</TableCell>
              <TableCell>Periods/Week</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings?.map((mapping) => (
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
                <TableCell align="right">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
