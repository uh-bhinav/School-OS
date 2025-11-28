import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { useClassRankList } from "@/app/services/classes.hooks";

interface ClassRankListTabProps {
  classId: number;
}

export default function ClassRankListTab({ classId }: ClassRankListTabProps) {
  const { data: rankList, isLoading, error } = useClassRankList(classId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load rank list: {error.message}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Academic Rank List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Roll No</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell align="right">Total Marks</TableCell>
              <TableCell align="right">Percentage</TableCell>
              <TableCell align="right">Average</TableCell>
              <TableCell>Grade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rankList?.map((entry) => (
              <TableRow
                key={entry.student_id}
                hover
                sx={{
                  bgcolor: entry.rank <= 3 ? "action.hover" : "inherit",
                }}
              >
                <TableCell>
                  <Chip
                    label={`#${entry.rank}`}
                    size="small"
                    color={entry.rank === 1 ? "success" : entry.rank <= 3 ? "primary" : "default"}
                  />
                </TableCell>
                <TableCell>{entry.roll_number}</TableCell>
                <TableCell>
                  <Typography fontWeight={entry.rank <= 3 ? "bold" : "medium"}>
                    {entry.full_name}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {entry.total_marks} / {entry.max_marks}
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="medium">{entry.percentage}%</Typography>
                </TableCell>
                <TableCell align="right">{entry.average}%</TableCell>
                <TableCell>
                  <Chip
                    label={entry.grade}
                    size="small"
                    color={
                      entry.grade.startsWith("A")
                        ? "success"
                        : entry.grade.startsWith("B")
                        ? "primary"
                        : "default"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
