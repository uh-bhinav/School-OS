import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert, IconButton, Tabs, Tab } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import StudentHeader from "./components/StudentHeader";
import StudentKPIsOverview from "./components/StudentKPIsOverview";
import AttendanceOverview from "./components/AttendanceOverview";
import MarksPanel from "./components/MarksPanel";
import ReportCardPanel from "./components/ReportCardPanel";
import MentorPanel from "./components/MentorPanel";
import TimetableMiniView from "./components/TimetableMiniView";
import AchievementsPanel from "./components/AchievementsPanel";
import ClubsPanel from "./components/ClubsPanel";
import FeesPanel from "./components/FeesPanel";
import CommunicationPanel from "./components/CommunicationPanel";
import { getStudentDetails } from "@/app/services/student-details.api";
import type { StudentDetail } from "@/app/mockDataProviders/mockStudentDetails";

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchStudentData() {
      if (!studentId) {
        setError("Student ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentDetails(Number(studentId));
        if (data) {
          setStudent(data);
        } else {
          setError("Student not found");
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError("Failed to load student details");
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId]);

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

  if (error || !student) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Student not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate("/academics/students")} size="small">
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Header Section */}
      <StudentHeader student={student} />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Attendance" />
          <Tab label="Marks & Performance" />
          <Tab label="Report Cards" />
          <Tab label="Timetable" />
          <Tab label="Achievements" />
          <Tab label="Clubs & Activities" />
          <Tab label="Fees" />
          <Tab label="Communications" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          <StudentKPIsOverview studentId={student.student_id} />
          <Box sx={{ mt: 3 }}>
            <MentorPanel student={student} />
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <AttendanceOverview studentId={student.student_id} />
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <MarksPanel studentId={student.student_id} />
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <ReportCardPanel studentId={student.student_id} />
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <TimetableMiniView studentId={student.student_id} classId={student.class_id} />
        </Box>
      )}

      {activeTab === 5 && (
        <Box>
          <AchievementsPanel studentId={student.student_id} />
        </Box>
      )}

      {activeTab === 6 && (
        <Box>
          <ClubsPanel studentId={student.student_id} />
        </Box>
      )}

      {activeTab === 7 && (
        <Box>
          <FeesPanel studentId={student.student_id} />
        </Box>
      )}

      {activeTab === 8 && (
        <Box>
          <CommunicationPanel studentId={student.student_id} />
        </Box>
      )}
    </Box>
  );
}
