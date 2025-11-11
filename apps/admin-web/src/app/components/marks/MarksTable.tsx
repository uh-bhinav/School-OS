import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Typography,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { Mark } from "@/app/services/marks.schema";

interface MarksTableProps {
  data: Mark[];
  loading?: boolean;
  onEdit?: (mark: Mark) => void;
  onDelete?: (markId: number) => void;
}

/**
 * MarksTable Component
 *
 * Displays marks data in a sortable, paginated table with actions.
 *
 * Features:
 * - Pagination with configurable rows per page
 * - Action menu for edit/delete operations
 * - Grade color coding
 * - Published status indicators
 * - Loading skeletons
 * - Empty state
 * - Responsive design
 *
 * Integration Note: Data from /api/v1/marks endpoint.
 * Edit/Delete callbacks trigger mutations that invalidate React Query cache.
 */
export function MarksTable({ data, loading, onEdit, onDelete }: MarksTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMark, setSelectedMark] = useState<Mark | null>(null);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, mark: Mark) => {
    setAnchorEl(event.currentTarget);
    setSelectedMark(mark);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMark(null);
  };

  const handleEdit = () => {
    if (selectedMark && onEdit) {
      onEdit(selectedMark);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedMark && onDelete) {
      onDelete(selectedMark.id);
    }
    handleMenuClose();
  };

  // Get grade color based on grade value
  const getGradeColor = (grade?: string): "success" | "info" | "warning" | "error" | "default" => {
    if (!grade) return "default";
    if (grade.startsWith("A")) return "success";
    if (grade.startsWith("B")) return "info";
    if (grade.startsWith("C")) return "warning";
    return "error";
  };

  // Loading state
  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell>Student</TableCell>
              <TableCell>Roll No</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Exam</TableCell>
              <TableCell align="center">Marks</TableCell>
              <TableCell align="center">Grade</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={50} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
                <TableCell><Skeleton width={70} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No marks found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters or add marks for this class/section/exam.
        </Typography>
      </Paper>
    );
  }

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Roll No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Exam</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Marks</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Grade</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((mark) => (
              <TableRow
                key={mark.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {mark.student_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {mark.roll_no || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{mark.subject_name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {mark.exam_name}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600}>
                    {mark.marks_obtained}/{mark.total_marks}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({((mark.marks_obtained / mark.total_marks) * 100).toFixed(1)}%)
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {mark.grade ? (
                    <Chip
                      label={mark.grade}
                      size="small"
                      color={getGradeColor(mark.grade)}
                      sx={{ fontWeight: 600, minWidth: 50 }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={mark.is_published ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    label={mark.is_published ? "Published" : "Draft"}
                    size="small"
                    color={mark.is_published ? "success" : "default"}
                    variant={mark.is_published ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, mark)}
                    aria-label="actions"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Marks</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
