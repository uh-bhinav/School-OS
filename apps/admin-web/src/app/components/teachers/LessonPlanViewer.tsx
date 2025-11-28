// ============================================================================
// FILE: src/app/components/teachers/LessonPlanViewer.tsx
// PURPOSE: Component to view teacher's lesson plans
// ============================================================================

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
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import {
  ExpandMore,
  AttachFile,
  PictureAsPdf,
  Slideshow,
  Image as ImageIcon,
  VideoFile,
  Description,
  CheckCircle,
  Schedule,
  PlayCircle,
  Edit,
  CalendarMonth,
} from "@mui/icons-material";
import { useLessonPlanListWithStats } from "@/app/services/lessonPlan.hooks";
import type { LessonPlan, LessonPlanAttachment } from "@/app/services/lessonPlan.api";

// ============================================================================
// TYPES
// ============================================================================

interface LessonPlanViewerProps {
  teacherId: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusChip(status: LessonPlan["status"]) {
  const config = {
    completed: { color: "success" as const, icon: <CheckCircle fontSize="small" /> },
    in_progress: { color: "warning" as const, icon: <PlayCircle fontSize="small" /> },
    approved: { color: "info" as const, icon: <CheckCircle fontSize="small" /> },
    draft: { color: "default" as const, icon: <Edit fontSize="small" /> },
  };

  const { color, icon } = config[status];
  const label = status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Chip
      label={label}
      size="small"
      color={color}
      icon={icon}
      variant="outlined"
    />
  );
}

function getFileIcon(fileType: LessonPlanAttachment["file_type"]) {
  const icons = {
    pdf: <PictureAsPdf color="error" />,
    doc: <Description color="primary" />,
    ppt: <Slideshow color="warning" />,
    image: <ImageIcon color="success" />,
    video: <VideoFile color="secondary" />,
  };
  return icons[fileType] || <AttachFile />;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

function StatsCard({
  title,
  value,
  total,
  color,
}: {
  title: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                bgcolor: color,
                borderRadius: 3,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {Math.round(percentage)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LessonPlanViewer({ teacherId }: LessonPlanViewerProps) {
  const { data, isLoading, isError, error } = useLessonPlanListWithStats(teacherId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Failed to load lesson plans: {(error as Error)?.message || "Unknown error"}
      </Alert>
    );
  }

  if (!data || data.plans.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CalendarMonth sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No Lesson Plans Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This teacher has not created any lesson plans yet.
        </Typography>
      </Box>
    );
  }

  const { plans, stats } = data;

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatsCard title="Total Plans" value={stats.total} total={stats.total} color="#667eea" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatsCard title="Completed" value={stats.completed} total={stats.total} color="#43a047" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatsCard title="In Progress" value={stats.inProgress} total={stats.total} color="#fb8c00" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatsCard title="Approved" value={stats.approved} total={stats.total} color="#039be5" />
        </Grid>
      </Grid>

      {/* Lesson Plans Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600 }}>Week</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date Range</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Topics</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Objectives</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Attachments</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.plan_id} hover>
                <TableCell>
                  <Chip
                    label={`Week ${plan.week}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {plan.subject_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDateRange(plan.start_date, plan.end_date)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {plan.topics.slice(0, 2).map((topic, idx) => (
                      <Chip
                        key={idx}
                        label={topic.length > 25 ? `${topic.substring(0, 25)}...` : topic}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {plan.topics.length > 2 && (
                      <Tooltip title={plan.topics.slice(2).join(", ")}>
                        <Chip
                          label={`+${plan.topics.length - 2} more`}
                          size="small"
                          color="default"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip
                    title={
                      <Box>
                        {plan.objectives.map((obj, idx) => (
                          <Typography key={idx} variant="caption" display="block">
                            • {obj}
                          </Typography>
                        ))}
                      </Box>
                    }
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ cursor: "help" }}>
                      {plan.objectives.length} objective{plan.objectives.length !== 1 ? "s" : ""}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {plan.attachments.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {plan.attachments.map((attachment) => (
                        <Tooltip key={attachment.attachment_id} title={`${attachment.file_name} (${attachment.file_size})`}>
                          <IconButton
                            size="small"
                            component={Link}
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {getFileIcon(attachment.file_type)}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No files
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{getStatusChip(plan.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detailed View with Accordions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarMonth color="primary" />
          Detailed View
        </Typography>

        {plans.map((plan) => (
          <Accordion key={plan.plan_id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                <Chip label={`Week ${plan.week}`} size="small" color="primary" />
                <Typography fontWeight="medium">{plan.subject_name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: "auto", mr: 2 }}>
                  {formatDateRange(plan.start_date, plan.end_date)}
                </Typography>
                {getStatusChip(plan.status)}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Topics Covered
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {plan.topics.map((topic, idx) => (
                      <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                        {topic}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Learning Objectives
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {plan.objectives.map((objective, idx) => (
                      <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                        {objective}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
                {plan.resources.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Resources
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {plan.resources.map((resource, idx) => (
                        <Chip key={idx} label={resource} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                )}
                {plan.attachments.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Attachments
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {plan.attachments.map((attachment) => (
                        <Chip
                          key={attachment.attachment_id}
                          icon={getFileIcon(attachment.file_type)}
                          label={`${attachment.file_name} (${attachment.file_size})`}
                          size="small"
                          variant="outlined"
                          component={Link}
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          clickable
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
