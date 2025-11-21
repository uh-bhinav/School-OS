import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface CustomConstraint {
  id: string;
  description: string;
  priority: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
}

interface TeacherConstraints {
  maxClassesPerDay: number;
  maxClassesPerWeek: number;
  minClassesPerDay: number;
  minClassesPerWeek: number;
  prioritizeCoreSubjects: boolean;
  coreSubjectNames: string[];
}

interface GenerateDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (constraints?: {
    customConstraints: CustomConstraint[];
    teacherConstraints: TeacherConstraints;
  }) => Promise<void>;
  filters: {
    academic_year_id: number;
    class_id: number;
    section: string;
  };
}

/**
 * Confirmation dialog for AI-assisted timetable generation with custom constraints
 */
export default function GenerateDialog({
  open,
  onClose,
  onConfirm,
  filters,
}: GenerateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [showConstraints, setShowConstraints] = useState(false);

  // Custom constraints state
  const [customConstraints, setCustomConstraints] = useState<CustomConstraint[]>([]);
  const [newConstraintText, setNewConstraintText] = useState("");
  const [newConstraintPriority, setNewConstraintPriority] = useState<1 | 2 | 3>(2);

  // Teacher workload constraints
  const [teacherConstraints, setTeacherConstraints] = useState<TeacherConstraints>({
    maxClassesPerDay: 6,
    maxClassesPerWeek: 30,
    minClassesPerDay: 2,
    minClassesPerWeek: 10,
    prioritizeCoreSubjects: true,
    coreSubjectNames: ["Mathematics", "Science", "Physics", "Chemistry", "Biology"],
  });

  const handleGenerate = async () => {
    setLoading(true);
    setStatus("generating");
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      await onConfirm({
        customConstraints,
        teacherConstraints,
      });
      clearInterval(interval);
      setProgress(100);
      setStatus("success");

      // Auto-close after success
      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);
    } catch (error) {
      clearInterval(interval);
      setStatus("error");
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStatus("idle");
    setProgress(0);
    setLoading(false);
    setCustomConstraints([]);
    setNewConstraintText("");
    setNewConstraintPriority(2);
    setShowConstraints(false);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetState();
    }
  };

  const addCustomConstraint = () => {
    if (newConstraintText.trim()) {
      setCustomConstraints([
        ...customConstraints,
        {
          id: Date.now().toString(),
          description: newConstraintText.trim(),
          priority: newConstraintPriority,
        },
      ]);
      setNewConstraintText("");
      setNewConstraintPriority(2);
    }
  };

  const removeConstraint = (id: string) => {
    setCustomConstraints(customConstraints.filter((c) => c.id !== id));
  };

  const getPriorityLabel = (priority: 1 | 2 | 3) => {
    switch (priority) {
      case 1:
        return "High";
      case 2:
        return "Medium";
      case 3:
        return "Low";
      default:
        return "Medium";
    }
  };

  const getPriorityColor = (
    priority: 1 | 2 | 3
  ): "error" | "warning" | "default" => {
    switch (priority) {
      case 1:
        return "error";
      case 2:
        return "warning";
      case 3:
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 9999 }} // Ensure dialog appears above chatbot and other overlays
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AutoAwesomeIcon color="primary" />
        AI Timetable Generation
      </DialogTitle>
      <DialogContent>
        {status === "idle" && (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will replace the current timetable for Class {filters.class_id}
              {" (Section: "}{filters.section}) with an AI-generated schedule.
            </Alert>

            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              What the AI will do:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Optimize teacher availability" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Prevent room conflicts" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Balance subject distribution" />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary="Minimize teacher idle time" />
              </ListItem>
            </List>

            {/* Custom Constraints Section */}
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Button
                startIcon={showConstraints ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowConstraints(!showConstraints)}
                size="small"
                sx={{ mb: 1 }}
              >
                <TuneIcon sx={{ mr: 1 }} />
                Custom Constraints ({customConstraints.length})
              </Button>

              <Collapse in={showConstraints}>
                <Box sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider'
                }}>
                  {/* Teacher Workload Constraints */}
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Teacher Workload Limits
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <TextField
                      label="Max Classes Per Day"
                      type="number"
                      size="small"
                      value={teacherConstraints.maxClassesPerDay}
                      onChange={(e) =>
                        setTeacherConstraints({
                          ...teacherConstraints,
                          maxClassesPerDay: parseInt(e.target.value) || 0,
                        })
                      }
                      inputProps={{ min: 1, max: 10 }}
                    />
                    <TextField
                      label="Max Classes Per Week"
                      type="number"
                      size="small"
                      value={teacherConstraints.maxClassesPerWeek}
                      onChange={(e) =>
                        setTeacherConstraints({
                          ...teacherConstraints,
                          maxClassesPerWeek: parseInt(e.target.value) || 0,
                        })
                      }
                      inputProps={{ min: 1, max: 50 }}
                    />
                    <TextField
                      label="Min Classes Per Day"
                      type="number"
                      size="small"
                      value={teacherConstraints.minClassesPerDay}
                      onChange={(e) =>
                        setTeacherConstraints({
                          ...teacherConstraints,
                          minClassesPerDay: parseInt(e.target.value) || 0,
                        })
                      }
                      inputProps={{ min: 0, max: 10 }}
                    />
                    <TextField
                      label="Min Classes Per Week"
                      type="number"
                      size="small"
                      value={teacherConstraints.minClassesPerWeek}
                      onChange={(e) =>
                        setTeacherConstraints({
                          ...teacherConstraints,
                          minClassesPerWeek: parseInt(e.target.value) || 0,
                        })
                      }
                      inputProps={{ min: 0, max: 50 }}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={teacherConstraints.prioritizeCoreSubjects}
                        onChange={(e) =>
                          setTeacherConstraints({
                            ...teacherConstraints,
                            prioritizeCoreSubjects: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Prioritize core subjects in morning slots"
                  />

                  <Divider sx={{ my: 2 }} />

                  {/* Custom Text Constraints */}
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Additional Constraints
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Add specific rules the AI should follow (e.g., "No PE classes before 11 AM", "Mathematics should have 1-day gap minimum")
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter constraint description..."
                      value={newConstraintText}
                      onChange={(e) => setNewConstraintText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCustomConstraint();
                        }
                      }}
                    />
                    <TextField
                      select
                      size="small"
                      label="Priority"
                      value={newConstraintPriority}
                      onChange={(e) => setNewConstraintPriority(parseInt(e.target.value) as 1 | 2 | 3)}
                      SelectProps={{ native: true }}
                      sx={{ minWidth: 120 }}
                    >
                      <option value={1}>High</option>
                      <option value={2}>Medium</option>
                      <option value={3}>Low</option>
                    </TextField>
                    <IconButton
                      color="primary"
                      onClick={addCustomConstraint}
                      disabled={!newConstraintText.trim()}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {/* Display Added Constraints */}
                  {customConstraints.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {customConstraints.map((constraint) => (
                        <Chip
                          key={constraint.id}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption">
                                [{getPriorityLabel(constraint.priority)}]
                              </Typography>
                              <Typography variant="body2">
                                {constraint.description}
                              </Typography>
                            </Box>
                          }
                          color={getPriorityColor(constraint.priority)}
                          onDelete={() => removeConstraint(constraint.id)}
                          deleteIcon={<DeleteIcon />}
                          sx={{ height: 'auto', py: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>

            <Alert severity="info" icon={<WarningIcon />} sx={{ mt: 2 }}>
              Tip: You can manually edit the generated timetable afterwards.
            </Alert>
          </>
        )}

        {status === "generating" && (
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom align="center">
              Generating optimized timetable...
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />
            <Typography variant="caption" color="text.secondary" align="center" display="block" mt={1}>
              {progress}% complete
            </Typography>
          </Box>
        )}

        {status === "success" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✨ Timetable generated successfully! Refreshing...
          </Alert>
        )}

        {status === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Generation failed. Please try again or contact support.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {status === "error" ? "Close" : "Cancel"}
        </Button>
        {status !== "success" && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            startIcon={<AutoAwesomeIcon />}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
