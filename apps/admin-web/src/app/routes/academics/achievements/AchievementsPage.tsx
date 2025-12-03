import { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  EmojiEvents,
  Search,
  Add,
  Edit,
  Delete,
  Verified,
  HourglassEmpty,
  TrendingUp,
  People,
  Star,
  School,
} from '@mui/icons-material';
import {
  getAchievementRules,
  getAllStudentAchievements,
  getAchievementKpi,
  getSchoolLeaderboard,
  getClubLeaderboard,
} from '@/app/services/achievements.api';
import type {
  AchievementPointRule,
  StudentAchievement,
  LeaderboardStudent,
  LeaderboardClub,
  AchievementType,
} from '@/app/services/achievement.schema';

export default function AchievementsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [rules, setRules] = useState<AchievementPointRule[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [kpi, setKpi] = useState({
    total_achievements: 0,
    students_recognized: 0,
    avg_points_per_student: 0,
    pending_verifications: 0,
    total_points_awarded: 0,
  });
  const [studentLeaderboard, setStudentLeaderboard] = useState<LeaderboardStudent[]>([]);
  const [clubLeaderboard, setClubLeaderboard] = useState<LeaderboardClub[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesData, achievementsData, kpiData, studentLB, clubLB] = await Promise.all([
        getAchievementRules(1),
        getAllStudentAchievements(1, false), // Get all including unverified
        getAchievementKpi(),
        getSchoolLeaderboard(1, 1),
        getClubLeaderboard(1, 1),
      ]);

      setRules(rulesData);
      setAchievements(achievementsData);
      setKpi(kpiData);
      setStudentLeaderboard(studentLB);
      setClubLeaderboard(clubLB);
    } catch (error) {
      console.error('Failed to load achievements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(rule =>
    rule.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAchievements = achievements.filter(achievement =>
    achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    achievement.achievement_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudentLeaderboard = studentLeaderboard.filter(student =>
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClubLeaderboard = clubLeaderboard.filter(club =>
    club.club_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAchievementTypeColor = (type: AchievementType) => {
    switch (type) {
      case 'academic': return 'primary';
      case 'sports': return 'success';
      case 'cultural': return 'secondary';
      case 'leadership': return 'warning';
      case 'community_service': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEvents sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight="bold">
            Achievements & Leaderboards
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} color="primary">
          Add Achievement
        </Button>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents color="warning" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Achievements
                </Typography>
                <Typography variant="h4">{kpi.total_achievements}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People color="primary" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Students Recognized
                </Typography>
                <Typography variant="h4">{kpi.students_recognized}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp color="success" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Avg Points/Student
                </Typography>
                <Typography variant="h4">{kpi.avg_points_per_student}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HourglassEmpty color="error" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Pending Verification
                </Typography>
                <Typography variant="h4">{kpi.pending_verifications}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star color="info" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Points Awarded
                </Typography>
                <Typography variant="h4">{kpi.total_points_awarded}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`Point Rules (${filteredRules.length})`} />
          <Tab label={`All Achievements (${filteredAchievements.length})`} />
          <Tab label={`Student Leaderboard (${filteredStudentLeaderboard.length})`} />
          <Tab label={`Club Leaderboard (${filteredClubLeaderboard.length})`} />
        </Tabs>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={
            tabValue === 0 ? "Search point rules..." :
            tabValue === 1 ? "Search achievements..." :
            tabValue === 2 ? "Search students..." :
            "Search clubs..."
          }
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

      {/* Point Rules Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Base Points</TableCell>
                <TableCell>Multipliers</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{rule.category_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.achievement_type}
                      size="small"
                      color={getAchievementTypeColor(rule.achievement_type)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">{rule.base_points}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {Object.entries(rule.level_multiplier).map(([level, mult]) => (
                        <Chip
                          key={level}
                          label={`${level}: ×${mult}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={rule.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* All Achievements Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Achievement</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date Awarded</TableCell>
                <TableCell>Points</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAchievements.map((achievement) => (
                <TableRow key={achievement.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {achievement.student_id.toString().slice(-2)}
                      </Avatar>
                      <Typography variant="body2">Student {achievement.student_id}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{achievement.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {achievement.achievement_category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={achievement.achievement_type}
                      size="small"
                      color={getAchievementTypeColor(achievement.achievement_type)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(achievement.date_awarded).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      {achievement.points_awarded}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {achievement.is_verified ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Verified color="success" fontSize="small" />
                        <Typography variant="caption" color="success.main">
                          Verified
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HourglassEmpty color="warning" fontSize="small" />
                        <Typography variant="caption" color="warning.main">
                          Pending
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!achievement.is_verified && (
                      <Button size="small" variant="outlined" color="success" startIcon={<Verified />}>
                        Verify
                      </Button>
                    )}
                    <IconButton size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Student Leaderboard Tab */}
      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Achievement Points</TableCell>
                <TableCell>Exam Points</TableCell>
                <TableCell>Club Points</TableCell>
                <TableCell>Total Points</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudentLeaderboard.map((student, index) => (
                <TableRow key={student.student_id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {index === 0 && <EmojiEvents sx={{ color: 'gold' }} />}
                      {index === 1 && <EmojiEvents sx={{ color: 'silver' }} />}
                      {index === 2 && <EmojiEvents sx={{ color: '#CD7F32' }} />}
                      <Typography fontWeight={index < 3 ? 'bold' : 'normal'}>
                        #{index + 1}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {student.student_name.charAt(0)}
                      </Avatar>
                      <Typography>{student.student_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={student.class_name || 'N/A'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{student.achievement_points}</TableCell>
                  <TableCell>{student.exam_points}</TableCell>
                  <TableCell>{student.club_points}</TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      {student.total_points}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Club Leaderboard Tab */}
      {tabValue === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Club Name</TableCell>
                <TableCell>Total Points</TableCell>
                <TableCell>Badge</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClubLeaderboard.map((club, index) => (
                <TableRow key={club.club_id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {index === 0 && <EmojiEvents sx={{ color: 'gold' }} />}
                      {index === 1 && <EmojiEvents sx={{ color: 'silver' }} />}
                      {index === 2 && <EmojiEvents sx={{ color: '#CD7F32' }} />}
                      <Typography fontWeight={index < 3 ? 'bold' : 'normal'}>
                        #{index + 1}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'grey.400' }}>
                        <School />
                      </Avatar>
                      <Typography fontWeight="medium">{club.club_name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      {club.total_points}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {index === 0 && <Chip label="🏆 Champion" color="warning" />}
                    {index === 1 && <Chip label="🥈 Runner Up" color="default" />}
                    {index === 2 && <Chip label="🥉 Third Place" color="default" />}
                    {index > 2 && index < 10 && <Chip label="⭐ Top 10" variant="outlined" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Empty State */}
      {((tabValue === 0 && filteredRules.length === 0) ||
        (tabValue === 1 && filteredAchievements.length === 0) ||
        (tabValue === 2 && filteredStudentLeaderboard.length === 0) ||
        (tabValue === 3 && filteredClubLeaderboard.length === 0)) && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No results found matching "{searchQuery}"
          </Typography>
        </Box>
      )}
    </Box>
  );
}
