import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert, IconButton, Tabs, Tab } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import TeacherHeader from "./components/TeacherHeader";
import WorkloadOverview from "./components/WorkloadOverview";
import TimetableGrid from "./components/TimetableGrid";
import PerformanceSection from "./components/PerformanceSection";
import MentorshipSection from "./components/MentorshipSection";
import ClubsSection from "./components/ClubsSection";
import CommunicationSection from "./components/CommunicationSection";
import AchievementSection from "./components/AchievementSection";
import { getTeacherDetails } from "@/app/services/teacher-details.api";
import type { TeacherDetail } from "@/app/mockDataProviders/mockTeacherDetails";

export default function TeacherDetailPage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Timetable" />
          <Tab label="Performance" />
          <Tab label="Mentorship" />
          <Tab label="Clubs" />
          <Tab label="Communications" />
          <Tab label="Achievements" />
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
          <MentorshipSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <ClubsSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 5 && (
        <Box>
          <CommunicationSection teacherId={teacher.teacher_id} />
        </Box>
      )}

      {activeTab === 6 && (
        <Box>
          <AchievementSection teacherId={teacher.teacher_id} />
        </Box>
      )}
    </Box>
  );
}
