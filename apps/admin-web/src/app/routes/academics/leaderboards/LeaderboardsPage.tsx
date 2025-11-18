// ============================================================================
// LEADERBOARDS PAGE
// ============================================================================

import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Paper,
  Chip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  getLeaderboardKpi,
  getSchoolLeaderboard,
  getClassLeaderboard,
  getClubLeaderboard,
} from "@/app/services/leaderboard.api";
import type { LeaderboardStudent, LeaderboardClub } from "@/app/services/leaderboard.schema";

export default function LeaderboardsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState(1);

  const { data: kpi } = useQuery({
    queryKey: ["leaderboard-kpi", 1],
    queryFn: () => getLeaderboardKpi(1),
  });

  const { data: schoolLeaderboard } = useQuery({
    queryKey: ["school-leaderboard", 1],
    queryFn: () => getSchoolLeaderboard(1),
  });

  const { data: classLeaderboard } = useQuery({
    queryKey: ["class-leaderboard", selectedClass, 1],
    queryFn: () => getClassLeaderboard(selectedClass, 1),
  });

  const { data: clubLeaderboard } = useQuery({
    queryKey: ["club-leaderboard", 1],
    queryFn: () => getClubLeaderboard(1),
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🏆 Leaderboards
      </Typography>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ p: 2, minWidth: 200, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Students
          </Typography>
          <Typography variant="h4">{kpi?.total_students || 0}</Typography>
        </Card>
        <Card sx={{ p: 2, minWidth: 200, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Total Achievements
          </Typography>
          <Typography variant="h4">{kpi?.total_achievements || 0}</Typography>
        </Card>
        <Card sx={{ p: 2, minWidth: 200, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Top Student
          </Typography>
          <Typography variant="h6">{kpi?.top_student_name || "N/A"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {kpi?.top_student_points || 0} points
          </Typography>
        </Card>
        <Card sx={{ p: 2, minWidth: 200, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Top Class
          </Typography>
          <Typography variant="h6">{kpi?.top_class_name || "N/A"}</Typography>
          <Typography variant="body2" color="text.secondary">
            Avg: {kpi?.top_class_avg_points || 0} pts
          </Typography>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label="School Leaderboard" />
          <Tab label="Class Leaderboard" />
          <Tab label="Club Leaderboard" />
        </Tabs>

        {/* School Leaderboard */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            <StudentLeaderboardTable students={schoolLeaderboard || []} />
          </Box>
        )}

        {/* Class Leaderboard */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Class:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classNum) => (
                  <Chip
                    key={classNum}
                    label={`Class ${classNum}`}
                    color={selectedClass === classNum ? "primary" : "default"}
                    onClick={() => setSelectedClass(classNum)}
                    clickable
                  />
                ))}
              </Box>
            </Box>
            <StudentLeaderboardTable students={classLeaderboard || []} />
          </Box>
        )}

        {/* Club Leaderboard */}
        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            <ClubLeaderboardTable clubs={clubLeaderboard || []} />
          </Box>
        )}
      </Card>
    </Box>
  );
}

function StudentLeaderboardTable({ students }: { students: LeaderboardStudent[] }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Rank</strong></TableCell>
            <TableCell><strong>Student Name</strong></TableCell>
            <TableCell><strong>Class</strong></TableCell>
            <TableCell><strong>Roll No</strong></TableCell>
            <TableCell align="right"><strong>Total Points</strong></TableCell>
            <TableCell align="right"><strong>Achievements</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.slice(0, 50).map((student) => (
            <TableRow key={student.student_id}>
              <TableCell>
                <Chip
                  label={student.rank}
                  color={student.rank <= 3 ? "primary" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>{student.student_name}</TableCell>
              <TableCell>Class {student.class_id} - {student.section}</TableCell>
              <TableCell>{student.roll_no}</TableCell>
              <TableCell align="right">
                <Typography variant="h6" color="primary">
                  {student.total_points}
                </Typography>
              </TableCell>
              <TableCell align="right">{student.achievement_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ClubLeaderboardTable({ clubs }: { clubs: LeaderboardClub[] }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Rank</strong></TableCell>
            <TableCell><strong>Club Name</strong></TableCell>
            <TableCell align="right"><strong>Total Points</strong></TableCell>
            <TableCell align="right"><strong>Members</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clubs.map((club) => (
            <TableRow key={club.club_id}>
              <TableCell>
                <Chip
                  label={club.rank}
                  color={club.rank <= 3 ? "primary" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body1" fontWeight="medium">
                  {club.club_name}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" color="primary">
                  {club.total_points}
                </Typography>
              </TableCell>
              <TableCell align="right">{club.member_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
