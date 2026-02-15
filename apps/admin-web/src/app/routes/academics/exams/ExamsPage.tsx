import { useState } from "react";
import { Box, Typography, Button, Alert, Paper, Tabs, Tab, Chip, Stack, Card, CardContent, IconButton } from "@mui/material";
import FiltersBar from "../../../components/exams/FiltersBar";
import KPICards from "../../../components/exams/KPICards";
import ExamList from "../../../components/exams/ExamList";
import ExamPeriodScheduler from "../../../components/exams/ExamPeriodScheduler";
import ExportMenu from "../../../components/exams/ExportMenu";
import Legend from "../../../components/exams/Legend";
import { useExams, useExamKPI, useExamTypes } from "../../../services/exams.hooks";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DraftsIcon from "@mui/icons-material/Drafts";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PublishIcon from "@mui/icons-material/Publish";
import ArchiveIcon from "@mui/icons-material/Archive";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const CLASSES = Array.from({ length: 10 }).map((_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ExamsPage() {
  const [filters, setFilters] = useState({
    academic_year_id: 2025,
    class_id: 8,
    section: "A",
    exam_type_id: undefined as number | undefined,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const { data: exams, isLoading, isError, refetch } = useExams(filters);
  const { data: kpi, isLoading: kpiLoading } = useExamKPI(filters);
  const { data: examTypes } = useExamTypes(1);

  const handleExportCSV = () => {
    if (!exams || exams.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Exam Title", "Type", "Date", "Total Marks", "Avg Score", "Pass Rate", "Status"];
    const rows = exams.map((exam) => [
      exam.title,
      exam.exam_type_name,
      exam.date,
      exam.total_marks.toString(),
      exam.average_score ? `${exam.average_score.toFixed(1)}%` : "-",
      exam.pass_percentage ? `${exam.pass_percentage.toFixed(0)}%` : "-",
      exam.is_published ? "Published" : "Draft",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exams_class_${filters.class_id}_section_${filters.section}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    alert("PDF export functionality will be implemented with backend integration");
  };

  // Mock data for different tabs
  const draftPeriods = [
    { id: 1, name: "Mid Term 2026", classes: 8, subjects: 48, created: "2026-01-15", status: "draft" },
  ];

  const hallTicketsGenerated = [
    { id: 1, period: "Final Exam 2025", class: "Class 8-A", count: 42, generated: "2025-12-10" },
    { id: 2, period: "Final Exam 2025", class: "Class 8-B", count: 40, generated: "2025-12-10" },
  ];

  const archivedPeriods = [
    { id: 1, name: "Mid Term 2025", type: "Mid-Term", classes: 10, date: "Jun 2025" },
    { id: 2, name: "Unit Test 1 2025", type: "Unit Test", classes: 10, date: "Apr 2025" },
  ];

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Exams Overview
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Chip
              label="AI Optimized Scheduling Enabled"
              size="small"
              sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600 }}
              icon={<AutoAwesomeIcon sx={{ color: "#2e7d32 !important" }} />}
            />
          </Box>
        </Box>
        <ExportMenu onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </Box>

      <FiltersBar
        value={filters}
        onChange={(v) => setFilters((s) => ({ ...s, ...v }))}
        classes={CLASSES}
        sections={SECTIONS}
        examTypes={examTypes}
        onApply={() => refetch()}
      />

      {isError && <Alert severity="error">Failed to load exams. Please retry.</Alert>}

      <KPICards
        totalExams={kpi?.total_exams ?? 0}
        avgPerformance={kpi?.avg_performance ?? 0}
        passRate={kpi?.pass_rate ?? 0}
        pendingResults={kpi?.pending_results ?? 0}
        publishedCount={kpi?.published_count ?? 0}
        isLoading={kpiLoading}
      />

      {/* Tab Navigation */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<CalendarMonthIcon />} iconPosition="start" label="Exam Periods" />
          <Tab icon={<DraftsIcon />} iconPosition="start" label="Draft Periods" />
          <Tab icon={<ConfirmationNumberIcon />} iconPosition="start" label="Hall Tickets" />
          <Tab icon={<PublishIcon />} iconPosition="start" label="Published Exams" />
          <Tab icon={<ArchiveIcon />} iconPosition="start" label="Archive" />
        </Tabs>

        {/* Exam Periods Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Active Exam Periods</Typography>
              <Button variant="contained" onClick={() => setDialogOpen(true)} sx={{
                bgcolor: "#0B5F5A",
                "&:hover": { bgcolor: "#094a46" },
              }}>
                + Schedule Exam Period
              </Button>
            </Box>
            <ExamList exams={exams ?? []} onRefresh={refetch} isLoading={isLoading} />
          </Box>
        </TabPanel>

        {/* Draft Periods Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Draft Exam Periods</Typography>
            <Stack spacing={1.5}>
              {draftPeriods.map(draft => (
                <Card key={draft.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{draft.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {draft.classes} classes • {draft.subjects} subjects • Created {draft.created}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label="Draft" color="warning" size="small" />
                      <Button size="small" variant="outlined">Resume</Button>
                      <IconButton size="small"><MoreVertIcon /></IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              {draftPeriods.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No draft periods found.
                </Typography>
              )}
            </Stack>
          </Box>
        </TabPanel>

        {/* Hall Tickets Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Generated Hall Tickets</Typography>
            <Stack spacing={1.5}>
              {hallTicketsGenerated.map(ht => (
                <Card key={ht.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{ht.period}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ht.class} • {ht.count} tickets • Generated {ht.generated}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label={`${ht.count} tickets`} color="info" size="small" />
                      <Button size="small" variant="outlined" startIcon={<ConfirmationNumberIcon />}>
                        View
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </TabPanel>

        {/* Published Exams Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Published Exams</Typography>
            <ExamList
              exams={(exams ?? []).filter(e => e.is_published)}
              onRefresh={refetch}
              isLoading={isLoading}
            />
          </Box>
        </TabPanel>

        {/* Archive Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Archived Exam Periods</Typography>
            <Stack spacing={1.5}>
              {archivedPeriods.map(arch => (
                <Card key={arch.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{arch.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {arch.type} • {arch.classes} classes • {arch.date}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label="Archived" size="small" variant="outlined" />
                      <Button size="small" variant="outlined">View Details</Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </TabPanel>
      </Paper>

      <Legend />

      <ExamPeriodScheduler
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        filters={filters}
        onSuccess={refetch}
      />
    </Box>
  );
}
