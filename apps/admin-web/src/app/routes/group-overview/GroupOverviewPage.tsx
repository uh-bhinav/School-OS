// ============================================================================
// GROUP OVERVIEW PAGE - Super Admin Landing Page with Full Dashboard
// ============================================================================
// Dashboard for super admin showing:
// - 5 Health Cards (Total Schools, Students, Attendance, Collection, Attention)
// - 3 Charts (Financial Trend, Health Distribution, Regional Performance)
// - Insights Grid with advisory cards
// - Live Alerts Feed
// - AI Input Bar (reused from principal dashboard)
// ============================================================================

import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  alpha,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  School as SchoolIcon,
  People as StudentsIcon,
  CalendarToday as AttendanceIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  ChevronRight as ChevronRightIcon,
  Info as InfoIcon,
  AccountBalance as FinanceIcon,
  Shield as ComplianceIcon,
  EmojiEvents as AcademicIcon,
  Settings as OperationsIcon,
  Forum as CommunicationIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../../providers/ThemeProvider";
import {
  mockSchools,
  mockRegions,
  mockFinancialTrends,
  mockAlerts,
  type School,
  type Alert,
  type InsightCard,
} from "../../mockDataProviders/mockSuperAdmin";

// ============================================================================
// ENHANCED HEALTH CARD COMPONENT - Eye-catching KPI Display
// ============================================================================
interface HealthCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color: "primary" | "success" | "warning" | "error" | "info";
  onClick?: () => void;
  isClickable?: boolean;
}

function HealthCard({ title, value, subtitle, icon, trend, color, onClick, isClickable = true }: HealthCardProps) {
  const { mode } = useThemeMode();

  // Rich gradient backgrounds for each color scheme
  const colorConfig = {
    primary: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)"
        : "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
      textColor: "#fff",
      subtextColor: "rgba(255,255,255,0.8)",
      trendBg: "rgba(255,255,255,0.15)",
    },
    success: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)"
        : "linear-gradient(135deg, #66bb6a 0%, #43a047 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
      textColor: "#fff",
      subtextColor: "rgba(255,255,255,0.8)",
      trendBg: "rgba(255,255,255,0.15)",
    },
    warning: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #f57c00 0%, #e65100 100%)"
        : "linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
      textColor: "#fff",
      subtextColor: "rgba(255,255,255,0.85)",
      trendBg: "rgba(255,255,255,0.15)",
    },
    error: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #c62828 0%, #b71c1c 100%)"
        : "linear-gradient(135deg, #ef5350 0%, #e53935 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
      textColor: "#fff",
      subtextColor: "rgba(255,255,255,0.8)",
      trendBg: "rgba(255,255,255,0.15)",
    },
    info: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #0277bd 0%, #01579b 100%)"
        : "linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
      textColor: "#fff",
      subtextColor: "rgba(255,255,255,0.8)",
      trendBg: "rgba(255,255,255,0.15)",
    },
  };

  const config = colorConfig[color];
  const canClick = isClickable && onClick;

  return (
    <Card
      sx={{
        height: "100%",
        cursor: canClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: config.gradient,
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        boxShadow: mode === "dark"
          ? "0 8px 32px rgba(0,0,0,0.4)"
          : "0 8px 32px rgba(0,0,0,0.15)",
        "&:hover": canClick
          ? {
              transform: "translateY(-6px) scale(1.02)",
              boxShadow: mode === "dark"
                ? "0 16px 48px rgba(0,0,0,0.5)"
                : "0 16px 48px rgba(0,0,0,0.2)",
            }
          : {},
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "150px",
          height: "150px",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        },
      }}
      onClick={canClick ? onClick : undefined}
    >
      <CardContent sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Top Row: Title + Icon */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: config.subtextColor,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: config.iconBg,
              color: config.textColor,
              backdropFilter: "blur(10px)",
              "& .MuiSvgIcon-root": {
                fontSize: "1.75rem",
              },
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Value - Large and Bold */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: config.textColor,
            lineHeight: 1.1,
            letterSpacing: "-1px",
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: config.subtextColor,
              fontSize: "0.8rem",
              display: "block",
              mb: 1,
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Trend Indicator */}
        {trend && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              backgroundColor: config.trendBg,
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              width: "fit-content",
            }}
          >
            {trend.isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 18, color: "#a5d6a7" }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 18, color: "#ef9a9a" }} />
            )}
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: trend.isPositive ? "#a5d6a7" : "#ef9a9a",
              }}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </Typography>
            <Typography
              sx={{
                fontSize: "0.7rem",
                color: config.subtextColor,
              }}
            >
              vs last month
            </Typography>
          </Box>
        )}

        {/* Footer CTA - Positioned at bottom with visual separation */}
        {canClick && (
          <Box
            sx={{
              mt: 2,
              pt: 1.5,
              borderTop: `1px solid ${alpha(config.textColor, 0.15)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: config.subtextColor,
                transition: "color 0.2s",
                "&:hover": { color: config.textColor },
              }}
            >
              View Details
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 16, color: config.subtextColor }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CHART INFO DIALOG - Explains what each chart shows
// ============================================================================
interface ChartInfoContent {
  title: string;
  whatItShows: string;
  whyItMatters: string;
  howToInterpret: string;
}

interface ChartInfoButtonProps {
  info: ChartInfoContent;
}

function ChartInfoButton({ info }: ChartInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const { mode } = useThemeMode();

  return (
    <>
      <Tooltip title="Learn about this chart">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          sx={{
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              backgroundColor: alpha("#1976d2", 0.1),
            },
          }}
        >
          <InfoIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundImage: mode === "dark"
              ? "linear-gradient(180deg, #1e1e2f 0%, #1a1a2e 100%)"
              : "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                color: "#fff",
              }}
            >
              <InfoIcon />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {info.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* What it shows */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="primary"
              fontWeight={600}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              📊 What This Shows
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {info.whatItShows}
            </Typography>
          </Box>

          {/* Why it matters */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="primary"
              fontWeight={600}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              💡 Why It Matters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {info.whyItMatters}
            </Typography>
          </Box>

          {/* How to interpret */}
          <Box>
            <Typography
              variant="subtitle2"
              color="primary"
              fontWeight={600}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              🎯 How to Interpret
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {info.howToInterpret}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Chart info content definitions
const chartInfoContent = {
  financialTrend: {
    title: "Group Financial Trend",
    whatItShows: "This multi-line chart displays the monthly fee collection (green) versus total expenses (red) across all schools in the group over the past 12 months. Values are shown in Lakhs (₹).",
    whyItMatters: "Financial health is critical for sustainable operations. This chart helps you identify trends in revenue vs. costs, spot seasonal patterns, and ensure the group maintains positive cash flow. Early detection of declining collections or rising expenses enables proactive intervention.",
    howToInterpret: "• Green line above red = healthy profit margin\n• Lines converging = shrinking margins, investigate\n• Sudden dips in green = collection issues at one or more schools\n• Steady upward green trend = growing revenue\n• Click to view detailed financial breakdown by school",
  },
  healthDistribution: {
    title: "School Health Distribution",
    whatItShows: "A donut chart showing how many schools fall into each health category: Healthy (85+ score), Moderate (70-84 score), and Critical (below 70 score). The health score combines attendance, fee collection, academic performance, and operational metrics.",
    whyItMatters: "Provides instant visibility into the overall portfolio health. A healthy group should have most schools in the green segment. Schools in yellow need monitoring, and red schools require immediate attention to prevent further decline.",
    howToInterpret: "• Click any segment to filter and see which schools are in that category\n• Green (Healthy): Maintain current practices, share best practices\n• Yellow (Moderate): Review recent changes, identify improvement areas\n• Red (Critical): Immediate intervention needed, schedule review meetings",
  },
  regionalPerformance: {
    title: "Regional Performance Comparison",
    whatItShows: "A grouped horizontal bar chart comparing attendance percentage (blue) and fee collection percentage (green) across each region. This allows regional managers to benchmark their performance against other regions.",
    whyItMatters: "Regional comparison reveals operational disparities and helps identify best practices that can be replicated. It also highlights regions that may need additional support or resources to meet group standards.",
    howToInterpret: "• Both bars should ideally be above 85%\n• Large gaps between attendance and collection indicate follow-up issues\n• Consistent high performers can mentor struggling regions\n• Low attendance often correlates with low collection - address root cause\n• Click to drill down into regional details",
  },
};

// ============================================================================
// ALERT ITEM COMPONENT
// ============================================================================
interface AlertItemProps {
  alert: Alert;
  onClick?: () => void;
}

function AlertItem({ alert, onClick }: AlertItemProps) {
  const { mode } = useThemeMode();
  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(alert.timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [alert.timestamp]);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        mb: 1,
        cursor: "pointer",
        backgroundColor: mode === "dark"
          ? alpha(alert.type === "urgent" ? "#d32f2f" : "#ed6c02", 0.1)
          : alpha(alert.type === "urgent" ? "#d32f2f" : "#ed6c02", 0.05),
        borderLeft: `3px solid ${alert.type === "urgent" ? "#d32f2f" : "#ed6c02"}`,
        "&:hover": {
          backgroundColor: mode === "dark"
            ? alpha(alert.type === "urgent" ? "#d32f2f" : "#ed6c02", 0.15)
            : alpha(alert.type === "urgent" ? "#d32f2f" : "#ed6c02", 0.1),
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <WarningIcon
          fontSize="small"
          sx={{ color: alert.type === "urgent" ? "error.main" : "warning.main", mt: 0.25 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {alert.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {alert.school}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
          {timeAgo}
        </Typography>
      </Box>
    </Box>
  );
}

// ============================================================================
// INSIGHT CARD COMPONENT
// ============================================================================
interface InsightCardComponentProps {
  insight: InsightCard;
  onClick?: () => void;
}

// ============================================================================
// CATEGORY ICON MAPPING - Replaces emojis with professional icons
// ============================================================================
const categoryIcons: Record<string, React.ReactNode> = {
  finance: <FinanceIcon sx={{ fontSize: 18 }} />,
  attendance: <AttendanceIcon sx={{ fontSize: 18 }} />,
  academic: <AcademicIcon sx={{ fontSize: 18 }} />,
  operations: <OperationsIcon sx={{ fontSize: 18 }} />,
  compliance: <ComplianceIcon sx={{ fontSize: 18 }} />,
  communication: <CommunicationIcon sx={{ fontSize: 18 }} />,
};

// Category color mapping - muted, professional palette
const categoryConfig: Record<string, { color: string; label: string }> = {
  finance: { color: "#2e7d32", label: "Finance" },
  attendance: { color: "#1565c0", label: "Attendance" },
  academic: { color: "#7b1fa2", label: "Academic" },
  operations: { color: "#e65100", label: "Operations" },
  compliance: { color: "#c62828", label: "Compliance" },
  communication: { color: "#0277bd", label: "Communication" },
};

// ============================================================================
// PROFESSIONAL INSIGHTS DATA - No emojis, clean copy
// ============================================================================
const professionalInsights: InsightCard[] = [
  {
    id: "insight-001",
    title: "Fee Collection Review Needed",
    description: "North region has the lowest average fee collection at 80.8%. Three schools are below the 85% threshold and require follow-up.",
    actionText: "View Region Details",
    actionRoute: "/schools?region=north",
    category: "finance",
    priority: "high",
    icon: "finance",
  },
  {
    id: "insight-002",
    title: "Compliance Action Required",
    description: "Two schools have licenses expiring within 90 days. Immediate renewal process should be initiated.",
    actionText: "View Compliance",
    actionRoute: "/compliance-risk",
    category: "compliance",
    priority: "high",
    icon: "compliance",
  },
  {
    id: "insight-003",
    title: "South Region Performance",
    description: "South region leads with 91.4% attendance and 88.7% collection. Best practices can be replicated across other regions.",
    actionText: "View Details",
    actionRoute: "/schools?region=south",
    category: "academic",
    priority: "medium",
    icon: "academic",
  },
  {
    id: "insight-004",
    title: "Attendance Intervention Needed",
    description: "Three schools show attendance below 85%. Recommend scheduling intervention meetings with principals.",
    actionText: "View Report",
    actionRoute: "/academics/attendance",
    category: "academic",
    priority: "high",
    icon: "academic",
  },
  {
    id: "insight-005",
    title: "Parent Communication Gap",
    description: "East region has lowest parent app adoption. Consider launching awareness campaigns to improve engagement.",
    actionText: "View Stats",
    actionRoute: "/communication",
    category: "communication",
    priority: "medium",
    icon: "communication",
  },
  {
    id: "insight-006",
    title: "Premium Schools Exceeding Targets",
    description: "All five Premium tier schools are meeting or exceeding financial and academic targets this quarter.",
    actionText: "View Schools",
    actionRoute: "/schools?tier=premium",
    category: "operations",
    priority: "low",
    icon: "operations",
  },
];

// ============================================================================
// INSIGHT CARD COMPONENT - Professional, larger, no emojis
// ============================================================================
interface InsightCardComponentProps {
  insight: InsightCard;
  onClick?: () => void;
}

function InsightCardComponent({ insight, onClick }: InsightCardComponentProps) {
  const { mode } = useThemeMode();

  const config = categoryConfig[insight.category] || { color: "#6b7280", label: insight.category };
  const IconComponent = categoryIcons[insight.category] || <OperationsIcon sx={{ fontSize: 18 }} />;

  // Truncate description if too long (140 chars)
  const truncatedDescription = insight.description.length > 140
    ? `${insight.description.slice(0, 137)}...`
    : insight.description;

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 180,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        border: `1px solid ${mode === "dark" ? alpha("#fff", 0.08) : alpha("#000", 0.06)}`,
        boxShadow: mode === "dark"
          ? "0 2px 8px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: mode === "dark"
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(0,0,0,0.1)",
          borderColor: alpha(config.color, 0.3),
        },
        "&:focus-visible": {
          outline: `2px solid ${config.color}`,
          outlineOffset: 2,
        },
      }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`${insight.title}. ${insight.actionText}`}
    >
      <CardContent
        sx={{
          p: 2.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 2.5 },
        }}
      >
        {/* Header: Icon Badge + Category Pill */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          {/* Icon Badge - Small, muted */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: alpha(config.color, mode === "dark" ? 0.15 : 0.08),
              color: config.color,
            }}
          >
            {IconComponent}
          </Box>
          {/* Category Pill - Subtle */}
          <Chip
            label={config.label}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.7rem",
              fontWeight: 500,
              backgroundColor: alpha(config.color, mode === "dark" ? 0.12 : 0.06),
              color: mode === "dark" ? alpha(config.color, 0.9) : config.color,
              border: `1px solid ${alpha(config.color, 0.2)}`,
              textTransform: "capitalize",
            }}
          />
        </Box>

        {/* Title - Medium-large, semi-bold */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: "0.925rem",
            lineHeight: 1.3,
            mb: 1,
            color: mode === "dark" ? "grey.100" : "grey.900",
          }}
        >
          {insight.title}
        </Typography>

        {/* Description - Normal weight, muted, better line-height */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.5,
            fontSize: "0.825rem",
            flex: 1,
            mb: 2,
          }}
        >
          {truncatedDescription}
        </Typography>

        {/* Footer CTA - Subtle inline link */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: config.color,
            mt: "auto",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 500,
              fontSize: "0.75rem",
            }}
          >
            {insight.actionText}
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN GROUP OVERVIEW COMPONENT
// ============================================================================
export default function GroupOverviewPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  // Calculate aggregate metrics from mock data
  const metrics = useMemo(() => {
    const totalSchools = mockSchools.length;
    const totalStudents = mockSchools.reduce((sum: number, s: School) => sum + s.totalStudents, 0);
    const avgAttendance = Math.round(
      mockSchools.reduce((sum: number, s: School) => sum + s.avgAttendance, 0) / totalSchools
    );
    const feeCollectionRate = Math.round(
      mockSchools.reduce((sum: number, s: School) => sum + s.feeCollectionRate, 0) / totalSchools
    );
    const schoolsNeedingAttention = mockSchools.filter(
      (s: School) => s.status === "attention" || s.status === "critical"
    ).length;

    return {
      totalSchools,
      totalStudents,
      avgAttendance,
      feeCollectionRate,
      schoolsNeedingAttention,
    };
  }, []);

  // Chart data - Health Distribution Donut
  const healthDistributionData = useMemo(() => {
    const healthy = mockSchools.filter((s: School) => s.healthScore >= 85).length;
    const moderate = mockSchools.filter((s: School) => s.healthScore >= 70 && s.healthScore < 85).length;
    const critical = mockSchools.filter((s: School) => s.healthScore < 70).length;
    return [
      { name: "Healthy (85+)", value: healthy, color: "#2e7d32" },
      { name: "Moderate (70-85)", value: moderate, color: "#ed6c02" },
      { name: "Critical (<70)", value: critical, color: "#d32f2f" },
    ];
  }, []);

  // Chart data - Regional Performance
  const regionalPerformanceData = useMemo(() => {
    return mockRegions.map((r) => ({
      name: r.name,
      attendance: Math.round(r.avgAttendance),
      collection: Math.round(r.avgFeeCollection),
    }));
  }, []);

  const handleAlertClick = (alert: Alert) => {
    console.log("[GROUP OVERVIEW] Alert clicked:", alert);
    // Navigate to relevant school or section
  };

  const handleInsightClick = (insight: InsightCard) => {
    if (insight.actionRoute) {
      navigate(insight.actionRoute);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Group Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time dashboard for Tapasya Vidyanikethan Group
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Health Cards Row - Using Grid v2 with size prop */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <HealthCard
            title="Total Schools"
            value={metrics.totalSchools}
            subtitle="Active institutions"
            icon={<SchoolIcon />}
            color="primary"
            onClick={() => navigate("/group-overview/schools")}
            isClickable={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <HealthCard
            title="Total Students"
            value={metrics.totalStudents.toLocaleString()}
            subtitle="Across all schools"
            icon={<StudentsIcon />}
            trend={{ value: 3.2, isPositive: true }}
            color="success"
            isClickable={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <HealthCard
            title="Avg Attendance"
            value={`${metrics.avgAttendance}%`}
            subtitle="Group average this month"
            icon={<AttendanceIcon />}
            trend={{ value: 1.5, isPositive: true }}
            color="info"
            onClick={() => navigate("/group-overview/academics")}
            isClickable={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <HealthCard
            title="Fee Collection"
            value={`${metrics.feeCollectionRate}%`}
            subtitle="Q4 target: 95%"
            icon={<MoneyIcon />}
            trend={{ value: 2.8, isPositive: true }}
            color="success"
            onClick={() => navigate("/group-overview/financial-health")}
            isClickable={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <HealthCard
            title="Needs Attention"
            value={metrics.schoolsNeedingAttention}
            subtitle="Schools requiring review"
            icon={<WarningIcon />}
            color={metrics.schoolsNeedingAttention > 0 ? "warning" : "success"}
            onClick={() => navigate("/group-overview/compliance-risk")}
            isClickable={true}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Financial Trend Line Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              p: 2.5,
              height: 320,
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: 4 },
            }}
            onClick={() => navigate("/group-overview/financial-health")}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 0 }}>
                  Group Financial Trend
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Monthly collection vs expenses (₹ Lakhs)
                </Typography>
              </Box>
              <ChartInfoButton info={chartInfoContent.financialTrend} />
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mockFinancialTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke={mode === "dark" ? "#333" : "#eee"} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  stroke={mode === "dark" ? "#666" : "#999"}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke={mode === "dark" ? "#666" : "#999"}
                  tickFormatter={(v) => `₹${v / 100000}L`}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
                    border: `1px solid ${mode === "dark" ? "#333" : "#ddd"}`,
                    borderRadius: 4,
                  }}
                  formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, ""]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="feeCollection"
                  name="Collection"
                  stroke="#2e7d32"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#d32f2f"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Health Distribution Donut Chart */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{
              p: 2.5,
              height: 320,
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: 4 },
            }}
            onClick={() => navigate("/group-overview/schools")}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 0 }}>
                  School Health Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Based on overall health score
                </Typography>
              </Box>
              <ChartInfoButton info={chartInfoContent.healthDistribution} />
            </Box>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={healthDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {healthDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
                    border: `1px solid ${mode === "dark" ? "#333" : "#ddd"}`,
                    borderRadius: 4,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              {healthDistributionData.map((item) => (
                <Box key={item.name} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                  <Typography variant="caption">{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Regional Performance Bar Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 2.5,
              height: 320,
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: 4 },
            }}
            onClick={() => navigate("/group-overview/schools")}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 0 }}>
                  Regional Performance
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Attendance & Collection by region
                </Typography>
              </Box>
              <ChartInfoButton info={chartInfoContent.regionalPerformance} />
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionalPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={mode === "dark" ? "#333" : "#eee"} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  stroke={mode === "dark" ? "#666" : "#999"}
                  domain={[0, 100]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  width={60}
                  stroke={mode === "dark" ? "#666" : "#999"}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
                    border: `1px solid ${mode === "dark" ? "#333" : "#ddd"}`,
                    borderRadius: 4,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="attendance" name="Attendance %" fill="#1976d2" barSize={12} radius={2} />
                <Bar dataKey="collection" name="Collection %" fill="#2e7d32" barSize={12} radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Insights & Alerts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Insights Grid - Larger cards, 2x3 layout */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 3,
              border: `1px solid ${mode === "dark" ? alpha("#fff", 0.06) : alpha("#000", 0.04)}`,
            }}
          >
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: "1.1rem" }}>
                Insights & Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                AI-powered advisory for your group
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {professionalInsights.map((insight) => (
                <Grid size={{ xs: 12, sm: 6 }} key={insight.id}>
                  <InsightCardComponent insight={insight} onClick={() => handleInsightClick(insight)} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Live Alerts Feed */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Live Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {mockAlerts.filter((a) => a.type === "urgent").length} urgent issues
                </Typography>
              </Box>
              <Chip
                icon={<TimeIcon sx={{ fontSize: 14 }} />}
                label="Live"
                size="small"
                color="error"
                sx={{ height: 22, fontSize: "0.7rem" }}
              />
            </Box>
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                maxHeight: 280,
                pr: 0.5,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: mode === "dark" ? "#444" : "#ccc",
                  borderRadius: 2,
                },
              }}
            >
              {mockAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onClick={() => handleAlertClick(alert)} />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
