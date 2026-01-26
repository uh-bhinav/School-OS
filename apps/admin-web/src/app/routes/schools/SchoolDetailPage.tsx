// ============================================================================
// SCHOOL DETAIL PAGE - Executive-Friendly Read-Only Inspection View
// ============================================================================
// When a Super Admin clicks "View School", this page answers:
// "Is this school healthy, who is responsible, and who do I contact?"
//
// Layout:
// [Top Header] [Summary Strip] [Overview Cards] [Health Breakdown]
// [School Info] [Key Contacts] [Informational Banner]
// ============================================================================

import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  alpha,
  IconButton,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  People as StudentsIcon,
  PersonOutline as StaffIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as CriticalIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  MenuBook as BoardIcon,
  EventNote as EstablishedIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  Verified as VerifiedIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useThemeMode } from "../../providers/ThemeProvider";
import { getSchoolById, getRegionByName, type School } from "../../mockDataProviders/mockSuperAdmin";

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================
const statusConfig: Record<School["status"], {
  color: "success" | "warning" | "error";
  label: string;
  icon: React.ReactElement;
  description: string;
}> = {
  healthy: {
    color: "success",
    label: "Healthy",
    icon: <HealthyIcon />,
    description: "School is performing well across all metrics"
  },
  attention: {
    color: "warning",
    label: "Watchlist",
    icon: <WarningIcon />,
    description: "Some metrics need monitoring or improvement"
  },
  critical: {
    color: "error",
    label: "Needs Attention",
    icon: <CriticalIcon />,
    description: "Urgent issues require immediate action"
  },
};

// ============================================================================
// COLORFUL OVERVIEW CARD COMPONENT (Matching GroupOverview style)
// ============================================================================
interface OverviewCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning" | "error" | "info" | "purple";
  trend?: { value: number; isPositive: boolean };
}

function OverviewCard({ title, value, subtitle, icon, color, trend }: OverviewCardProps) {
  const { mode } = useThemeMode();

  const colorConfig = {
    primary: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)"
        : "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
    },
    success: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)"
        : "linear-gradient(135deg, #66bb6a 0%, #43a047 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
    },
    warning: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #f57c00 0%, #e65100 100%)"
        : "linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
    },
    error: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #c62828 0%, #b71c1c 100%)"
        : "linear-gradient(135deg, #ef5350 0%, #e53935 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
    },
    info: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #0277bd 0%, #01579b 100%)"
        : "linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
    },
    purple: {
      gradient: mode === "dark"
        ? "linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)"
        : "linear-gradient(135deg, #ba68c8 0%, #9c27b0 100%)",
      iconBg: mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)",
    },
  };

  const config = colorConfig[color];

  return (
    <Card
      sx={{
        height: "100%",
        background: config.gradient,
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
        boxShadow: mode === "dark"
          ? "0 8px 32px rgba(0,0,0,0.4)"
          : "0 8px 32px rgba(0,0,0,0.15)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "120px",
          height: "120px",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          transform: "translate(30%, -30%)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.7rem",
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: config.iconBg,
              color: "#fff",
              backdropFilter: "blur(10px)",
              "& .MuiSvgIcon-root": { fontSize: "1.4rem" },
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
            mb: 0.5,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem" }}>
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: "auto", pt: 1 }}>
            {trend.isPositive ? (
              <TrendUpIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} />
            ) : (
              <TrendDownIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} />
            )}
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}% vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HEALTH SCORE BAR COMPONENT
// ============================================================================
interface HealthBarProps {
  label: string;
  score: number;
  icon: React.ReactNode;
}

function HealthBar({ label, score, icon }: HealthBarProps) {
  const { mode } = useThemeMode();
  const color = score >= 85 ? "#4caf50" : score >= 70 ? "#ff9800" : "#f44336";
  const bgColor = score >= 85 ? alpha("#4caf50", 0.1) : score >= 70 ? alpha("#ff9800", 0.1) : alpha("#f44336", 0.1);

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: mode === "dark" ? alpha("#fff", 0.05) : bgColor,
        border: `1px solid ${mode === "dark" ? alpha("#fff", 0.1) : alpha(color, 0.2)}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Chip
          label={`${score}%`}
          size="small"
          sx={{
            backgroundColor: alpha(color, 0.15),
            color: color,
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        />
      </Box>
      <Box
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: mode === "dark" ? alpha("#fff", 0.1) : alpha("#000", 0.08),
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${score}%`,
            backgroundColor: color,
            borderRadius: 4,
            transition: "width 0.6s ease-out",
          }}
        />
      </Box>
    </Box>
  );
}

// ============================================================================
// CONTACT CARD COMPONENT
// ============================================================================
interface ContactCardProps {
  role: string;
  name: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
}

function ContactCard({ role, name, email, phone, isPrimary }: ContactCardProps) {
  const { mode } = useThemeMode();

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.6) : "#fff",
        boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
        border: isPrimary
          ? `2px solid ${mode === "dark" ? alpha("#4caf50", 0.5) : alpha("#4caf50", 0.3)}`
          : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isPrimary && (
        <Chip
          label="Primary Contact"
          size="small"
          icon={<VerifiedIcon sx={{ fontSize: "0.9rem !important" }} />}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: mode === "dark" ? alpha("#4caf50", 0.2) : alpha("#4caf50", 0.1),
            color: "#4caf50",
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        />
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: mode === "dark"
              ? "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)"
              : "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <PersonIcon />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            {role}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {name}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <EmailIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography
            variant="body2"
            component="a"
            href={`mailto:${email}`}
            sx={{
              color: mode === "dark" ? "#90caf9" : "#1976d2",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {email}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography
            variant="body2"
            component="a"
            href={`tel:${phone}`}
            sx={{
              color: mode === "dark" ? "#90caf9" : "#1976d2",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {phone}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ============================================================================
// INFO ROW COMPONENT
// ============================================================================
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SchoolDetailPage() {
  const { mode } = useThemeMode();
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();

  const school = schoolId ? getSchoolById(parseInt(schoolId, 10)) : undefined;
  const region = school ? getRegionByName(school.region) : undefined;

  // Not found state
  if (!school) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.6) : "#fff",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            School not found
          </Typography>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate("/group-overview/schools")}
            sx={{ mt: 2 }}
          >
            Back to Schools
          </Button>
        </Paper>
      </Box>
    );
  }

  const statusInfo = statusConfig[school.status];

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ================================================================== */}
      {/* TOP HEADER - School Name, Location, Status */}
      {/* ================================================================== */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <IconButton
          onClick={() => navigate("/group-overview/schools")}
          sx={{
            mt: 0.5,
            backgroundColor: mode === "dark" ? alpha("#fff", 0.08) : alpha("#000", 0.04),
            "&:hover": {
              backgroundColor: mode === "dark" ? alpha("#fff", 0.12) : alpha("#000", 0.08),
            },
          }}
        >
          <BackIcon />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h4" fontWeight={700}>
              {school.name}
            </Typography>
            <Chip
              icon={statusInfo.icon}
              label={statusInfo.label}
              color={statusInfo.color}
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
            <LocationIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body1" color="text.secondary">
              {school.city}, {school.state}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mx: 0.5 }}>
              •
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {school.region} Region
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mx: 0.5 }}>
              •
            </Typography>
            <Chip
              label={school.board}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500, fontSize: "0.75rem" }}
            />
          </Box>
        </Box>
      </Box>

      {/* ================================================================== */}
      {/* SUMMARY STRIP - Overall Health Score */}
      {/* ================================================================== */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          backgroundColor: mode === "dark"
            ? alpha(statusInfo.color === "success" ? "#4caf50" : statusInfo.color === "warning" ? "#ff9800" : "#f44336", 0.15)
            : alpha(statusInfo.color === "success" ? "#4caf50" : statusInfo.color === "warning" ? "#ff9800" : "#f44336", 0.08),
          border: `1px solid ${alpha(
            statusInfo.color === "success" ? "#4caf50" : statusInfo.color === "warning" ? "#ff9800" : "#f44336",
            0.3
          )}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssessmentIcon sx={{ color: "text.secondary" }} />
          <Typography variant="body1" color="text.secondary">
            Overall Health Score
          </Typography>
        </Box>
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{
            color: statusInfo.color === "success" ? "#4caf50" : statusInfo.color === "warning" ? "#ff9800" : "#f44336",
          }}
        >
          {school.healthScore}%
        </Typography>
        <Tooltip title={statusInfo.description}>
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* ================================================================== */}
      {/* OVERVIEW CARDS - Key Metrics (Colorful Cards) */}
      {/* ================================================================== */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <OverviewCard
            title="Total Students"
            value={school.totalStudents.toLocaleString()}
            subtitle="Currently enrolled"
            icon={<StudentsIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <OverviewCard
            title="Total Staff"
            value={school.totalStaff.toLocaleString()}
            subtitle="Teaching & admin"
            icon={<StaffIcon />}
            color="purple"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <OverviewCard
            title="Attendance Rate"
            value={`${school.avgAttendance.toFixed(1)}%`}
            subtitle="Average this month"
            icon={<CalendarIcon />}
            color={school.avgAttendance >= 90 ? "success" : school.avgAttendance >= 80 ? "warning" : "error"}
            trend={{ value: 2.3, isPositive: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <OverviewCard
            title="Fee Collection"
            value={`${school.feeCollectionRate}%`}
            subtitle="Of target collected"
            icon={<MoneyIcon />}
            color={school.feeCollectionRate >= 85 ? "success" : school.feeCollectionRate >= 70 ? "warning" : "error"}
            trend={{ value: 5.1, isPositive: school.feeCollectionRate >= 75 }}
          />
        </Grid>
      </Grid>

      {/* ================================================================== */}
      {/* MAIN CONTENT - Health Breakdown + School Info */}
      {/* ================================================================== */}
      <Grid container spacing={3}>
        {/* Health Breakdown */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.6) : "#fff",
              boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>
              Health Score Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <HealthBar label="Academic Performance" score={school.academicScore} icon={<SchoolIcon fontSize="small" />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <HealthBar label="Financial Health" score={school.financialScore} icon={<MoneyIcon fontSize="small" />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <HealthBar label="Compliance Status" score={school.complianceScore} icon={<VerifiedIcon fontSize="small" />} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <HealthBar label="Operational Efficiency" score={school.operationalScore} icon={<BusinessIcon fontSize="small" />} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* School Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.6) : "#fff",
              boxShadow: mode === "dark" ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>
              School Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <InfoRow icon={<BadgeIcon fontSize="small" />} label="School Code" value={school.code} />
              <InfoRow icon={<BusinessIcon fontSize="small" />} label="Tier" value={school.tier} />
              <InfoRow icon={<BoardIcon fontSize="small" />} label="Board" value={school.board} />
              <InfoRow icon={<EstablishedIcon fontSize="small" />} label="Established" value={school.established.toString()} />
              <Divider sx={{ my: 1, borderColor: mode === "dark" ? alpha("#fff", 0.08) : alpha("#000", 0.06) }} />
              <InfoRow icon={<CalendarIcon fontSize="small" />} label="Last Audit" value={new Date(school.lastAuditDate).toLocaleDateString()} />
              <InfoRow
                icon={<VerifiedIcon fontSize="small" />}
                label="License Expiry"
                value={new Date(school.licenseExpiry).toLocaleDateString()}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ================================================================== */}
      {/* KEY CONTACTS */}
      {/* ================================================================== */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <ContactIcon fontSize="small" />
          Key Contacts
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ContactCard
              role="School Principal"
              name={school.principal}
              email={school.principalEmail}
              phone={school.principalPhone}
              isPrimary
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            {region ? (
              <ContactCard
                role="Regional Manager"
                name={region.manager}
                email={region.managerEmail}
                phone={region.managerPhone}
              />
            ) : (
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: mode === "dark" ? alpha("#1a1a2e", 0.6) : "#fff",
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">Regional manager not assigned</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* ================================================================== */}
      {/* INFORMATIONAL BANNER */}
      {/* ================================================================== */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: mode === "dark" ? alpha("#1976d2", 0.15) : alpha("#1976d2", 0.08),
          border: `1px solid ${mode === "dark" ? alpha("#1976d2", 0.3) : alpha("#1976d2", 0.2)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <InfoIcon sx={{ color: mode === "dark" ? "#90caf9" : "#1976d2" }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          This is a read-only inspection view. For detailed operations, access the school's Principal Dashboard or contact the school directly.
        </Typography>
      </Paper>
    </Box>
  );
}
