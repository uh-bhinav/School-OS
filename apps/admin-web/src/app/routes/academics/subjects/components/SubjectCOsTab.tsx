// ============================================================================
// SUBJECT COs TAB - CRITICAL COMPONENT
// ============================================================================
// This is the core OBE component where Course Outcomes are managed per grade.
// COs are the foundation for exam question mapping and attainment calculations.

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InfoIcon from "@mui/icons-material/Info";
import { SubjectDetail, CourseOutcome, BloomLevel } from "@/app/services/obe.schema";
import { useCOsBySubjectAndGrade, useBulkApproveCOs, useCreateCO, useUpdateCO, useDeleteCO } from "@/app/services/obe.hooks";
import { useAuthStore } from "@/app/stores/useAuthStore";

interface SubjectCOsTabProps {
  subject: SubjectDetail;
}

const BLOOM_LEVELS: BloomLevel[] = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

const BLOOM_COLORS: Record<BloomLevel, string> = {
  Remember: "#90CAF9",
  Understand: "#81C784",
  Apply: "#FFD54F",
  Analyze: "#FFB74D",
  Evaluate: "#FF8A65",
  Create: "#CE93D8",
};

export default function SubjectCOsTab({ subject }: SubjectCOsTabProps) {
  const schoolId = useAuthStore((state) => state.schoolId) || 1;
  const [selectedGrade, setSelectedGrade] = useState<number>(subject.grades_taught[0] || 10);
  const [selectedCOs, setSelectedCOs] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCO, setEditingCO] = useState<CourseOutcome | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [coToDelete, setCoToDelete] = useState<CourseOutcome | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    bloom_level: "Understand" as BloomLevel,
  });

  // API hooks
  const { data: courseCOs, isLoading } = useCOsBySubjectAndGrade(subject.subject_id, selectedGrade);
  const bulkApproveMutation = useBulkApproveCOs();
  const createCOMutation = useCreateCO();
  const updateCOMutation = useUpdateCO();
  const deleteCOMutation = useDeleteCO();

  const cos: CourseOutcome[] = courseCOs || [];
  const pendingCOs = cos.filter((co) => co.status === "draft");
  const approvedCOs = cos.filter((co) => co.status === "approved");
  const allSelected = cos.length > 0 && selectedCOs.length === cos.length;

  // Handlers
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCOs([]);
    } else {
      setSelectedCOs(cos.map((co) => co.id));
    }
  };

  const handleSelectCO = (coId: number) => {
    setSelectedCOs((prev) =>
      prev.includes(coId) ? prev.filter((id) => id !== coId) : [...prev, coId]
    );
  };

  const handleBulkApprove = () => {
    const draftIdsToApprove = selectedCOs.filter((id) =>
      cos.find((co) => co.id === id && co.status === "draft")
    );
    if (draftIdsToApprove.length > 0) {
      bulkApproveMutation.mutate(draftIdsToApprove);
      setSelectedCOs([]);
    }
  };

  const handleOpenDialog = (co?: CourseOutcome) => {
    if (co) {
      setEditingCO(co);
      setFormData({
        code: co.code,
        description: co.description,
        bloom_level: co.bloom_level || "Understand",
      });
    } else {
      setEditingCO(null);
      const nextNumber = cos.length + 1;
      setFormData({
        code: `CO${nextNumber}`,
        description: "",
        bloom_level: "Understand",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCO(null);
    setFormData({ code: "", description: "", bloom_level: "Understand" });
  };

  const handleSaveCO = () => {
    if (editingCO) {
      updateCOMutation.mutate({
        coId: editingCO.id,
        data: formData,
      });
    } else {
      createCOMutation.mutate({
        school_id: schoolId,
        subject_id: subject.subject_id,
        grade: selectedGrade,
        status: "draft",
        ...formData,
      });
    }
    handleCloseDialog();
  };

  const handleDeleteClick = (co: CourseOutcome) => {
    setCoToDelete(co);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (coToDelete) {
      deleteCOMutation.mutate(coToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setCoToDelete(null);
  };

  const getStatusChip = (status: string) => {
    if (status === "approved") {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Approved"
          size="small"
          color="success"
          variant="outlined"
        />
      );
    }
    return (
      <Chip
        icon={<HourglassEmptyIcon />}
        label="Draft"
        size="small"
        color="warning"
        variant="outlined"
      />
    );
  };

  const getBloomColor = (level?: BloomLevel): string => {
    if (!level) return "#E0E0E0";
    return BLOOM_COLORS[level];
  };

  return (
    <Box>
      {/* Header with Grade Selector and Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Grade</InputLabel>
            <Select
              value={selectedGrade}
              label="Grade"
              onChange={(e) => {
                setSelectedGrade(e.target.value as number);
                setSelectedCOs([]);
              }}
            >
              {subject.grades_taught.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  Grade {grade}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`${approvedCOs.length} Approved`}
              size="small"
              color="success"
              variant="filled"
            />
            <Chip
              label={`${pendingCOs.length} Pending`}
              size="small"
              color="warning"
              variant="filled"
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedCOs.length > 0 && pendingCOs.some((co) => selectedCOs.includes(co.id)) && (
            <Button
              variant="outlined"
              color="success"
              onClick={handleBulkApprove}
              startIcon={<CheckCircleIcon />}
            >
              Approve Selected ({selectedCOs.filter((id) => pendingCOs.some((co) => co.id === id)).length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add CO
          </Button>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Course Outcomes (COs) define what students should achieve after completing this subject.
          Only <strong>Approved</strong> COs can be mapped to exam questions.
        </Typography>
      </Alert>

      {/* Progress Bar */}
      {cos.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Approval Progress</Typography>
            <Typography variant="body2" fontWeight="bold">
              {Math.round((approvedCOs.length / cos.length) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(approvedCOs.length / cos.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
            color={approvedCOs.length === cos.length ? "success" : "primary"}
          />
        </Box>
      )}

      {/* COs Table */}
      {isLoading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={selectedCOs.length > 0 && !allSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ width: 100 }}>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell sx={{ width: 130 }}>Bloom Level</TableCell>
                <TableCell sx={{ width: 120 }}>Status</TableCell>
                <TableCell sx={{ width: 100 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" gutterBottom>
                      No Course Outcomes defined for Grade {selectedGrade}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                    >
                      Add First CO
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                cos.map((co) => (
                  <TableRow key={co.id} hover selected={selectedCOs.includes(co.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCOs.includes(co.id)}
                        onChange={() => handleSelectCO(co.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {co.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{co.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={co.bloom_level || "N/A"}
                        size="small"
                        sx={{
                          bgcolor: getBloomColor(co.bloom_level),
                          color: "text.primary",
                        }}
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(co.status)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(co)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(co)}
                          disabled={co.status === "approved"}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Bloom's Taxonomy Legend */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Bloom's Taxonomy Levels
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {BLOOM_LEVELS.map((level, index) => (
            <Chip
              key={level}
              label={`${index + 1}. ${level}`}
              size="small"
              sx={{ bgcolor: BLOOM_COLORS[level], color: "text.primary" }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Lower levels (Remember, Understand) → Higher levels (Evaluate, Create) indicate increasing cognitive complexity.
        </Typography>
      </Paper>

      {/* Add/Edit CO Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCO ? "Edit Course Outcome" : "Add Course Outcome"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="CO Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., CO1"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <FormControl fullWidth>
                <InputLabel>Bloom Level</InputLabel>
                <Select
                  value={formData.bloom_level}
                  label="Bloom Level"
                  onChange={(e) =>
                    setFormData({ ...formData, bloom_level: e.target.value as BloomLevel })
                  }
                >
                  {BLOOM_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: BLOOM_COLORS[level],
                          }}
                        />
                        {level}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what students should be able to do after completing this outcome..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCO}
            disabled={!formData.code || !formData.description}
          >
            {editingCO ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Course Outcome?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{coToDelete?.code}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
