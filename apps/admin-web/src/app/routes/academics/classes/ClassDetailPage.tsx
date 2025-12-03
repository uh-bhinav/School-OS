import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert, IconButton, Tabs, Tab } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useClassById } from "@/app/services/classes.hooks";
import ClassHeaderCard from "./components/ClassHeaderCard";
import ClassOverviewTab from "./components/ClassOverviewTab";
import ClassStudentsTab from "./components/ClassStudentsTab";
import ClassTimetableTab from "./components/ClassTimetableTab";
import ClassSubjectMappingTab from "./components/ClassSubjectMappingTab";
import ClassRankListTab from "./components/ClassRankListTab";
import ClassLeaderboardTab from "./components/ClassLeaderboardTab";

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { data: classDetail, isLoading, error } = useClassById(Number(classId));

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (!classId || isNaN(Number(classId))) {
      navigate("/academics/classes");
    }
  }, [classId, navigate]);

  if (isLoading) {
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

  if (error || !classDetail) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error?.message || "Class not found"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate("/academics/classes")} size="small">
          <ArrowBack />
        </IconButton>
      </Box>

      {/* Header Section */}
      <ClassHeaderCard classDetail={classDetail} />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Students" />
          <Tab label="Timetable" />
          <Tab label="Subject-Teacher Mapping" />
          <Tab label="Academic Rank List" />
          <Tab label="Holistic Leaderboard" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && <ClassOverviewTab classId={classDetail.class_id} />}
      {activeTab === 1 && <ClassStudentsTab classId={classDetail.class_id} />}
      {activeTab === 2 && <ClassTimetableTab classId={classDetail.class_id} />}
      {activeTab === 3 && <ClassSubjectMappingTab classId={classDetail.class_id} />}
      {activeTab === 4 && <ClassRankListTab classId={classDetail.class_id} />}
      {activeTab === 5 && <ClassLeaderboardTab classId={classDetail.class_id} />}
    </Box>
  );
}
