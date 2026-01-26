// ============================================================================
// SUBJECT DETAIL PAGE
// ============================================================================
// Detail page for a single subject with tabs: Overview, Classes, COs, Exams, Reports

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import ChecklistIcon from "@mui/icons-material/Checklist";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useSubject } from "@/app/services/obe.hooks";
import {
  SubjectHeaderCard,
  SubjectOverviewTab,
  SubjectClassesTab,
  SubjectCOsTab,
  SubjectExamsTab,
  SubjectReportsTab,
} from "./components";

// Tab configuration
const TABS = [
  { id: "overview", label: "Overview", icon: <DashboardIcon /> },
  { id: "classes", label: "Classes", icon: <SchoolIcon /> },
  { id: "cos", label: "Course Outcomes", icon: <ChecklistIcon /> },
  { id: "exams", label: "Exams", icon: <AssignmentIcon /> },
  { id: "reports", label: "Reports", icon: <BarChartIcon /> },
];

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const { data: subject, isLoading, error } = useSubject(
    subjectId ? parseInt(subjectId, 10) : null
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  // Error state
  if (error || !subject) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load subject details. The subject may not exist or there was a network error.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <IconButton onClick={() => navigate("/academics/subjects")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body1" component="span" sx={{ ml: 1 }}>
            Back to Subjects
          </Typography>
        </Box>
      </Box>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <SubjectOverviewTab subject={subject} />;
      case 1:
        return <SubjectClassesTab subject={subject} />;
      case 2:
        return <SubjectCOsTab subject={subject} />;
      case 3:
        return <SubjectExamsTab subject={subject} />;
      case 4:
        return <SubjectReportsTab subject={subject} />;
      default:
        return <SubjectOverviewTab subject={subject} />;
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton size="small" onClick={() => navigate("/academics/subjects")}>
          <ArrowBackIcon />
        </IconButton>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/academics")}
          >
            Academics
          </Link>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/academics/subjects")}
          >
            Subjects
          </Link>
          <Typography color="text.primary">{subject.subject_name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header Card */}
      <SubjectHeaderCard subject={subject} />

      {/* Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.id}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{ minHeight: 56 }}
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Paper>
    </Box>
  );
}
