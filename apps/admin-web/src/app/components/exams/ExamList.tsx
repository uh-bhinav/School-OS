import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  Typography,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assessment as ReportIcon,
  Publish as PublishIcon,
  UnpublishedOutlined as UnpublishIcon,
} from "@mui/icons-material";
import { Exam } from "../../services/exams.schema";
import ExamDetailDialog from "./ExamDetailDialog";
import ReportCardPreview from "./ReportCardPreview";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import AddEditExamDialog from "./AddEditExamDialog";
import { usePublishExam } from "../../services/exams.hooks";

interface ExamListProps {
  exams: Exam[];
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function ExamList({ exams, onRefresh, isLoading = false }: ExamListProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reportCardOpen, setReportCardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuExam, setMenuExam] = useState<Exam | null>(null);

  const publishMutation = usePublishExam();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, exam: Exam) => {
    setAnchorEl(event.currentTarget);
    setMenuExam(exam);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuExam(null);
  };

  const handleViewDetails = (exam: Exam) => {
    setSelectedExam(exam);
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  const handleViewReport = (exam: Exam) => {
    setSelectedExam(exam);
    setReportCardOpen(true);
    handleMenuClose();
  };

  const handleEdit = (exam: Exam) => {
    setSelectedExam(exam);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = (exam: Exam) => {
    setSelectedExam(exam);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleTogglePublish = async (exam: Exam) => {
    try {
      await publishMutation.mutateAsync({
        id: exam.id,
        publish: !exam.is_published,
      });
      onRefresh();
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
    handleMenuClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Total Marks</TableCell>
              <TableCell align="center">Avg Score</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (exams.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          color: "text.secondary",
        }}
      >
        <Typography variant="h6" gutterBottom>
          No exams found
        </Typography>
        <Typography variant="body2">
          Try adjusting your filters or add a new exam to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Exam Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Total Marks
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Avg Score
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Pass Rate
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => (
              <TableRow
                key={exam.id}
                hover
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  transition: "background-color 0.2s",
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {exam.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={exam.exam_type_name}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>{formatDate(exam.date)}</TableCell>
                <TableCell align="center">{exam.total_marks}</TableCell>
                <TableCell align="center">
                  {exam.is_published && (exam.average_score ?? 0) > 0
                    ? `${(exam.average_score ?? 0).toFixed(1)}%`
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  {exam.is_published && (exam.pass_percentage ?? 0) > 0
                    ? `${(exam.pass_percentage ?? 0).toFixed(0)}%`
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={exam.is_published ? "Published" : "Draft"}
                    size="small"
                    color={exam.is_published ? "success" : "default"}
                    sx={{
                      fontWeight: 600,
                      ...(exam.is_published && {
                        bgcolor: "#d4edda",
                        color: "#155724",
                      }),
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, exam)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuExam && handleViewDetails(menuExam)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => menuExam && handleViewReport(menuExam)}>
          <ListItemIcon>
            <ReportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Report Card</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => menuExam && handleEdit(menuExam)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Exam</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => menuExam && handleTogglePublish(menuExam)}>
          <ListItemIcon>
            {menuExam?.is_published ? (
              <UnpublishIcon fontSize="small" />
            ) : (
              <PublishIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {menuExam?.is_published ? "Unpublish" : "Publish"}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => menuExam && handleDelete(menuExam)}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      {selectedExam && (
        <>
          <ExamDetailDialog
            open={detailDialogOpen}
            onClose={() => {
              setDetailDialogOpen(false);
              setSelectedExam(null);
            }}
            exam={selectedExam}
          />

          <ReportCardPreview
            open={reportCardOpen}
            onClose={() => {
              setReportCardOpen(false);
              setSelectedExam(null);
            }}
            examId={selectedExam.id}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedExam(null);
            }}
            exam={selectedExam}
            onSuccess={onRefresh}
          />

          <AddEditExamDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedExam(null);
            }}
            exam={selectedExam}
            filters={{
              academic_year_id: selectedExam.academic_year_id,
              class_id: selectedExam.class_id,
              section: selectedExam.section,
            }}
            onSuccess={onRefresh}
          />
        </>
      )}
    </>
  );
}
