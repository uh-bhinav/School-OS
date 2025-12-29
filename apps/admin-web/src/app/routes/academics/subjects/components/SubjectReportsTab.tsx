// ============================================================================
// SUBJECT REPORTS TAB
// ============================================================================
// Reports view showing CO Attainment data - placeholder for Phase 7

import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import DownloadIcon from "@mui/icons-material/Download";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import { SubjectDetail } from "@/app/services/obe.schema";

interface SubjectReportsTabProps {
  subject: SubjectDetail;
}

// Mock attainment data - would come from API in production
const MOCK_CO_ATTAINMENT = [
  { code: "CO1", description: "Apply mathematical concepts", target: 70, achieved: 78, status: "achieved" },
  { code: "CO2", description: "Solve algebraic equations", target: 70, achieved: 65, status: "partial" },
  { code: "CO3", description: "Analyze geometric problems", target: 70, achieved: 72, status: "achieved" },
  { code: "CO4", description: "Evaluate statistical data", target: 70, achieved: 58, status: "not_achieved" },
  { code: "CO5", description: "Apply trigonometric functions", target: 70, achieved: 75, status: "achieved" },
];

const MOCK_CLASS_ATTAINMENT = [
  { class_name: "Grade 10-A", avg_attainment: 75, students_above_target: 28, total_students: 32 },
  { class_name: "Grade 10-B", avg_attainment: 68, students_above_target: 22, total_students: 30 },
];

export default function SubjectReportsTab({ subject }: SubjectReportsTabProps) {
  const overallAttainment = Math.round(
    MOCK_CO_ATTAINMENT.reduce((sum, co) => sum + co.achieved, 0) / MOCK_CO_ATTAINMENT.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved": return "success";
      case "partial": return "warning";
      case "not_achieved": return "error";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "achieved": return "Achieved";
      case "partial": return "Partial";
      case "not_achieved": return "Not Achieved";
      default: return status;
    }
  };

  return (
    <Box>
      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          CO Attainment reports are calculated based on exam marks and CO-Question mappings.
          Reports update automatically when marks are entered and COs are mapped.
        </Typography>
      </Alert>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BarChartIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  Overall Attainment
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {overallAttainment}%
              </Typography>
              <Chip
                label={overallAttainment >= 70 ? "On Target" : "Below Target"}
                size="small"
                color={overallAttainment >= 70 ? "success" : "warning"}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="subtitle2" color="text.secondary">
                  COs Achieved
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {MOCK_CO_ATTAINMENT.filter(co => co.status === "achieved").length}/{MOCK_CO_ATTAINMENT.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Above 70% target
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <GroupIcon color="info" />
                <Typography variant="subtitle2" color="text.secondary">
                  Classes Analyzed
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {MOCK_CLASS_ATTAINMENT.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {MOCK_CLASS_ATTAINMENT.reduce((sum, c) => sum + c.total_students, 0)} students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <DownloadIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Export Report
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={{ mt: 1 }}>
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CO Attainment Table */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6">Course Outcome Attainment</Typography>
          <Typography variant="body2" color="text.secondary">
            {subject.subject_name} - All Grades
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CO Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Target (%)</TableCell>
                <TableCell>Attainment</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_CO_ATTAINMENT.map((co) => (
                <TableRow key={co.code} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {co.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{co.description}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{co.target}%</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 150 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(co.achieved, 100)}
                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        color={getStatusColor(co.status) as "success" | "warning" | "error"}
                      />
                      <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 40 }}>
                        {co.achieved}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(co.status)}
                      size="small"
                      color={getStatusColor(co.status) as "success" | "warning" | "error" | "default"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Class-wise Attainment */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6">Class-wise Attainment</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Average Attainment</TableCell>
                <TableCell>Students Above Target</TableCell>
                <TableCell>Success Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_CLASS_ATTAINMENT.map((cls) => {
                const successRate = Math.round((cls.students_above_target / cls.total_students) * 100);
                return (
                  <TableRow key={cls.class_name} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {cls.class_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={cls.avg_attainment}
                          sx={{ width: 100, height: 8, borderRadius: 4 }}
                          color={cls.avg_attainment >= 70 ? "success" : "warning"}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {cls.avg_attainment}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {cls.students_above_target} / {cls.total_students}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${successRate}%`}
                        size="small"
                        color={successRate >= 70 ? "success" : "warning"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
