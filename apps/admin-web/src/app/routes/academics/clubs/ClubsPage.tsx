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
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Search, Edit, Delete, Add, People as PeopleIcon, Event, EmojiEvents, CalendarToday } from '@mui/icons-material';
import { getClubs, getClubActivities, getClubKPI, getClubMemberships } from '@/app/services/clubs.api';
import type { Club, ClubActivity, ClubMembership, ClubActivityStatus, ClubType } from '@/app/services/club.schema';

export default function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [activities, setActivities] = useState<ClubActivity[]>([]);
  const [kpi, setKpi] = useState({
    active_clubs: 0,
    total_members: 0,
    events_this_month: 0,
    avg_members_per_club: 0,
    most_active_club: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ClubActivity | null>(null);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clubsData, activitiesData, kpiData] = await Promise.all([
        getClubs(1, true),
        getClubActivities(),
        getClubKPI(),
      ]);

      setClubs(clubsData);
      setActivities(activitiesData);
      setKpi(kpiData);
    } catch (error) {
      console.error('Failed to load club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMembers = async (club: Club) => {
    setSelectedClub(club);
    const members = await getClubMemberships(club.id);
    setMemberships(members);
    setShowMembersDialog(true);
  };

  const handleViewActivity = (activity: ClubActivity) => {
    setSelectedActivity(activity);
    setShowActivityDialog(true);
  };

  const filteredClubs = clubs.filter(
    (club: Club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivities = activities.filter(
    (activity: ClubActivity) =>
      activity.activity_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: ClubActivityStatus) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'primary';
      case 'planned': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getClubTypeColor = (type: ClubType) => {
    switch (type) {
      case 'academic': return 'primary';
      case 'sports': return 'success';
      case 'arts': return 'secondary';
      case 'technical': return 'info';
      case 'social': return 'warning';
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
        <Typography variant="h4" fontWeight="bold">
          Clubs & Activities
        </Typography>
        <Button variant="contained" startIcon={<Add />} color="primary">
          Add Club
        </Button>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="primary" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Total Clubs
                </Typography>
                <Typography variant="h4">{kpi.active_clubs}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="success" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Active Members
                </Typography>
                <Typography variant="h4">{kpi.total_members}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="info" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Events This Month
                </Typography>
                <Typography variant="h4">{kpi.events_this_month}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents color="warning" />
              <Box>
                <Typography color="text.secondary" variant="body2">
                  Most Active
                </Typography>
                <Typography variant="h6" noWrap>{kpi.most_active_club}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`Clubs (${filteredClubs.length})`} />
          <Tab label={`Activities (${filteredActivities.length})`} />
        </Tabs>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={tabValue === 0 ? "Search clubs..." : "Search activities..."}
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

      {/* Clubs Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Club Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Meeting Frequency</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClubs.map((club: Club) => (
                <TableRow key={club.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={club.logo_url}>{club.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography fontWeight="medium">{club.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {club.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={club.club_type}
                      size="small"
                      color={getClubTypeColor(club.club_type)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" textTransform="capitalize">
                      {club.meeting_frequency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                      onClick={() => handleViewMembers(club)}
                    >
                      <PeopleIcon fontSize="small" />
                      <Typography>
                        {club.current_member_count} / {club.max_members || '∞'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={club.registration_open ? 'Open' : 'Closed'}
                      size="small"
                      color={club.registration_open ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={club.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      color={club.is_active ? 'success' : 'default'}
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

      {/* Activities Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Activity</TableCell>
                <TableCell>Club</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivities.map((activity: ClubActivity) => (
                <TableRow key={activity.id} hover onClick={() => handleViewActivity(activity)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Event color="primary" />
                      <Box>
                        <Typography fontWeight="medium">{activity.activity_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {clubs.find((c: Club) => c.id === activity.club_id)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={activity.activity_type}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(activity.scheduled_date).toLocaleDateString()}
                    </Typography>
                    {activity.start_time && (
                      <Typography variant="caption" color="text.secondary">
                        {activity.start_time} - {activity.end_time}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{activity.venue || 'TBD'}</TableCell>
                  <TableCell>
                    {activity.budget_allocated ? `₹${activity.budget_allocated.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={activity.status}
                      size="small"
                      color={getStatusColor(activity.status)}
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
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

      {(tabValue === 0 && filteredClubs.length === 0) || (tabValue === 1 && filteredActivities.length === 0) ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No {tabValue === 0 ? 'clubs' : 'activities'} found matching "{searchQuery}"
          </Typography>
        </Box>
      ) : null}

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onClose={() => setShowMembersDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedClub?.name} - Members ({memberships.length})
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Contribution Score</TableCell>
                  <TableCell>Attendance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberships.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.student_id}</TableCell>
                    <TableCell>
                      <Chip label={member.role} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        size="small"
                        color={member.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{member.contribution_score}</TableCell>
                    <TableCell>{member.attendance_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMembersDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Activity Details Dialog */}
      <Dialog open={showActivityDialog} onClose={() => setShowActivityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedActivity?.activity_name}</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Type:</strong> {selectedActivity.activity_type}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Description:</strong> {selectedActivity.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Date:</strong> {new Date(selectedActivity.scheduled_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Time:</strong> {selectedActivity.start_time} - {selectedActivity.end_time}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Venue:</strong> {selectedActivity.venue}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Budget:</strong> ₹{selectedActivity.budget_allocated?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Max Participants:</strong> {selectedActivity.max_participants}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Attendance Mandatory:</strong> {selectedActivity.attendance_mandatory ? 'Yes' : 'No'}
              </Typography>
              {selectedActivity.outcome_notes && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Outcome:</strong> {selectedActivity.outcome_notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActivityDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
