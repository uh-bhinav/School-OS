import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  alpha,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import type { AvailableTeacher } from "../../services/proxy.api";

interface SubstituteTeacherCardProps {
  teacher: AvailableTeacher;
  onAssign: (teacher: AvailableTeacher) => void;
  isAssigning?: boolean;
}

/**
 * Card component to display an available substitute teacher
 * Used in the Proxy Assignment page
 */
export default function SubstituteTeacherCard({
  teacher,
  onAssign,
  isAssigning = false,
}: SubstituteTeacherCardProps) {
  // Get initials from teacher name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine card background based on availability
  const cardBg = teacher.isFreeThisPeriod
    ? (theme: any) =>
        `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
    : undefined;

  const avatarBg = teacher.isFreeThisPeriod ? "success.main" : "grey.400";

  return (
    <Card
      elevation={0}
      sx={{
        border: (theme) =>
          `1px solid ${teacher.isFreeThisPeriod ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider}`,
        borderRadius: 2,
        background: cardBg,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) =>
            `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header: Avatar + Name + Status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: avatarBg,
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {getInitials(teacher.teacherName)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {teacher.teacherName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {teacher.employeeCode}
              </Typography>
            </Box>
          </Box>

          {/* Availability Status */}
          {teacher.isFreeThisPeriod ? (
            <Chip
              icon={<CheckCircleIcon />}
              label="Free this period"
              color="success"
              size="small"
              sx={{
                fontWeight: 500,
                "& .MuiChip-icon": { fontSize: 16 },
              }}
            />
          ) : (
            <Chip
              icon={<ScheduleIcon />}
              label="Busy"
              color="default"
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 500,
                "& .MuiChip-icon": { fontSize: 16 },
              }}
            />
          )}
        </Box>

        {/* Details Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1.5,
            mb: 2,
          }}
        >
          {/* Primary Subject */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SchoolIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {teacher.primarySubject}
            </Typography>
          </Box>

          {/* Experience */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WorkIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {teacher.experienceYears} years exp.
            </Typography>
          </Box>

          {/* Qualification */}
          <Tooltip title={teacher.qualification}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: 120 }}
              >
                {teacher.qualification}
              </Typography>
            </Box>
          </Tooltip>

          {/* Today's Load */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Today: {teacher.currentLoad}/{teacher.maxLoad} classes
            </Typography>
          </Box>
        </Box>

        {/* Contact Info (collapsed) */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            color: "text.secondary",
            fontSize: "0.75rem",
          }}
        >
          <Tooltip title={teacher.email}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <EmailIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                {teacher.email}
              </Typography>
            </Box>
          </Tooltip>
          <Tooltip title={teacher.phone}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption">{teacher.phone}</Typography>
            </Box>
          </Tooltip>
        </Box>

        {/* Action Button */}
        <Button
          variant={teacher.isFreeThisPeriod ? "contained" : "outlined"}
          color={teacher.isFreeThisPeriod ? "success" : "primary"}
          fullWidth
          onClick={() => onAssign(teacher)}
          disabled={isAssigning}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {isAssigning ? "Assigning..." : "Assign as Substitute"}
        </Button>
      </CardContent>
    </Card>
  );
}
