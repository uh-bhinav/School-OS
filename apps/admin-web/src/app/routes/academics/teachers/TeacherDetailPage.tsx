import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import { ArrowBack, School, PersonAdd } from "@mui/icons-material";
import TeacherHeader from "./components/TeacherHeader";
import WorkloadOverview from "./components/WorkloadOverview";
import TimetableGrid from "./components/TimetableGrid";
import PerformanceSection from "./components/PerformanceSection";
import MentorshipSection from "./components/MentorshipSection";
import ClubsSection from "./components/ClubsSection";
import CommunicationSection from "./components/CommunicationSection";
import AchievementSection from "./components/AchievementSection";
import TeacherTasksSection from "./components/TeacherTasksSection";
import LessonPlanViewer from "@/app/components/teachers/LessonPlanViewer";
import AssignClassTeacherDialog from "@/app/components/teachers/AssignClassTeacherDialog";
import { getTeacherDetails } from "@/app/services/teacher-details.api";
import { useClassForTeacher } from "@/app/services/teachersFilters.hooks";
import type { TeacherDetail } from "@/app/mockDataProviders/mockTeacherDetails";

export default function TeacherDetailPage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Fetch class teacher assignment info
  const { data: classAssignment, refetch: refetchClassAssignment } = useClassForTeacher(
    Number(teacherId) || 0
  );

  useEffect(() => {
    async function fetchTeacherData() {
      if (!teacherId) {
        setError("Teacher ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getTeacherDetails(Number(teacherId));
        if (data) {
          setTeacher(data);
        } else {
          setError("Teacher not found");
        }
      } catch (err) {
        console.error("Error fetching teacher details:", err);
        setError("Failed to load teacher details");
      } finally {
        setLoading(false);
      }
    }

    fetchTeacherData();
  }, [teacherId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAssignDialogClose = () => {
    setAssignDialogOpen(false);
    // Refetch class assignment info when dialog closes
    refetchClassAssignment();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !teacher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Teacher not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate("/academics/teachers")} size="small">
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Header Section */}
      <TeacherHeader teacher={teacher} />

      {/* Assign Class Teacher Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: 2,
          mb: 3,
          p: 2,
          bgcolor: classAssignment ? "success.50" : "grey.50",
          borderRadius: 1,
          border: "1px solid",
          borderColor: classAssignment ? "success.200" : "grey.200",
        }}
      >
        {classAssignment ? (
          <>
            <School color="success" />
            <Box sx={{ flex: 1 }}>
              <Chip
                icon={<School />}
                label={`Class Teacher: ${classAssignment.class_name} ${classAssignment.section}`}
                color="success"
                variant="filled"
              />
            </Box>
            <Tooltip title="Reassign to a different class">
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAdd />}
                onClick={() => setAssignDialogOpen(true)}
              >
                Reassign
              </Button>
            </Tooltip>
          </>
        ) : (
          <>
            <PersonAdd color="action" />
            <Box sx={{ flex: 1 }}>
              <Chip label="Not assigned as Class Teacher" variant="outlined" />
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAdd />}
              onClick={() => setAssignDialogOpen(true)}
            >
              Assign as Class Teacher
            </Button>
          </>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Timetable" />
          <Tab label="Performance" />
          <Tab label="Lesson Plans" />
          <Tab label="Mentorship" />
          <Tab label="Clubs" />
          <Tab label="Communications" />
          <Tab label="Achievements" />
          <Tab label="Tasks" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <WorkloadOverview teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <TimetableGrid teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <PerformanceSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <LessonPlanViewer teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <MentorshipSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 5 && (
        <Box>
          <ClubsSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 6 && (
        <Box>
          <CommunicationSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 7 && (
        <Box>
          <AchievementSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 8 && (
        <Box>
          <TeacherTasksSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {/* Assign Class Teacher Dialog */}
      <AssignClassTeacherDialog
        open={assignDialogOpen}
        onClose={handleAssignDialogClose}
        teacherId={teacher.teacher_id}
        teacherName={teacher.full_name}
      />
    </Box>
  );
}
