import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { School, Class, CalendarMonth, Work } from "@mui/icons-material";
import { getTeacherWorkloadKpi } from "@/app/services/teacher-details.api";
import type { TeacherWorkloadKpi } from "@/app/mockDataProviders/mockTeacherTimetable";

interface WorkloadOverviewProps {
  teacherId: number;
}

export default function WorkloadOverview({ teacherId }: WorkloadOverviewProps) {
  const [kpi, setKpi] = useState<TeacherWorkloadKpi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTeacherWorkloadKpi(teacherId);
        setKpi(data);
      } catch (error) {
        console.error("Error fetching workload KPI:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <CircularProgress />;
  if (!kpi) return null;

  const getWorkloadColor = (status: string) => {
    switch (status) {
      case "Light": return "#43e97b";
      case "Moderate": return "#4facfe";
      case "Heavy": return "#fa709a";
      case "Overloaded": return "#f093fb";
      default: return "#667eea";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Teaching Workload</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.teaching_periods}</Typography>
                <Typography variant="body2">Teaching Periods/Week</Typography>
              </Box>
              <CalendarMonth sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.classes_taught}</Typography>
                <Typography variant="body2">Classes Taught</Typography>
              </Box>
              <Class sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.subjects_taught}</Typography>
                <Typography variant="body2">Subjects Taught</Typography>
              </Box>
              <School sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ background: `linear-gradient(135deg, ${getWorkloadColor(kpi.workload_status)} 0%, ${getWorkloadColor(kpi.workload_status)}cc 100%)`, color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">{kpi.workload_status}</Typography>
                <Typography variant="body2">Workload Status</Typography>
              </Box>
              <Work sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
