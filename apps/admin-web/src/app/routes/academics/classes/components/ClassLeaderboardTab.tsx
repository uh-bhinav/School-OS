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
  LinearProgress,
} from "@mui/material";
import { useClassLeaderboard } from "@/app/services/classes.hooks";

interface ClassLeaderboardTabProps {
  classId: number;
}

export default function ClassLeaderboardTab({ classId }: ClassLeaderboardTabProps) {
  const { data: leaderboard, isLoading, error } = useClassLeaderboard(classId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load leaderboard: {error.message}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Holistic Leaderboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Comprehensive student performance based on academics, attendance, behavior, sports, and extracurricular activities
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Roll No</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Academic</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Behavior</TableCell>
              <TableCell>Sports</TableCell>
              <TableCell>Extra-curricular</TableCell>
              <TableCell>Achievements</TableCell>
              <TableCell>Final Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard?.map((entry) => (
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
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={entry.academic_score}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2">{entry.academic_score}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={entry.attendance_score}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2">{entry.attendance_score}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={entry.behavior_score}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2">{entry.behavior_score}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={entry.sports_score}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2">{entry.sports_score}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 100 }}>
                    <LinearProgress
                      variant="determinate"
                      value={entry.extracurricular_score}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2">{entry.extracurricular_score}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip label={entry.achievements_count} size="small" color="secondary" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.final_composite_score.toFixed(1)}
                    size="small"
                    color={
                      entry.final_composite_score >= 80
                        ? "success"
                        : entry.final_composite_score >= 60
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
