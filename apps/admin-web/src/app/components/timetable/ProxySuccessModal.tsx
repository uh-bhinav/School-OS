import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Avatar,
  alpha,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import type { ProxyAssignment } from "../../stores/useProxyStore";

interface ProxySuccessModalProps {
  open: boolean;
  onClose: () => void;
  assignment: ProxyAssignment | null;
}

/**
 * Success modal shown after successfully assigning a substitute teacher
 */
export default function ProxySuccessModal({
  open,
  onClose,
  assignment,
}: ProxySuccessModalProps) {
  const navigate = useNavigate();

  if (!assignment) return null;

  // Get initials from teacher name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleReturnToTimetable = () => {
    onClose();
    navigate("/academics/timetable");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 440,
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Success Header */}
        <Box
          sx={{
            p: 4,
            pb: 3,
            textAlign: "center",
            background: (theme) =>
              `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0)} 100%)`,
          }}
        >
          {/* Success Icon */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "success.main",
              color: "white",
              mb: 2,
              boxShadow: (theme) =>
                `0 8px 24px ${alpha(theme.palette.success.main, 0.4)}`,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40 }} />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Substitute Assigned Successfully!
          </Typography>
        </Box>

        {/* Assignment Details */}
        <Box sx={{ p: 3, pt: 2 }}>
          {/* Teachers Visual */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 3,
              py: 2,
            }}
          >
            {/* Absent Teacher */}
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "grey.400",
                  mx: "auto",
                  mb: 1,
                  textDecoration: "line-through",
                  opacity: 0.7,
                }}
              >
                {getInitials(assignment.absentTeacherName)}
              </Avatar>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {assignment.absentTeacherName}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Absent
              </Typography>
            </Box>

            {/* Arrow */}
            <ArrowRightAltIcon
              sx={{ fontSize: 32, color: "success.main", mx: 1 }}
            />

            {/* Substitute Teacher */}
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "success.main",
                  mx: "auto",
                  mb: 1,
                }}
              >
                {getInitials(assignment.substituteTeacherName)}
              </Avatar>
              <Typography variant="body2" fontWeight={600}>
                {assignment.substituteTeacherName}
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={500}>
                Substitute
              </Typography>
            </Box>
          </Box>

          {/* Details */}
          <Box
            sx={{
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ lineHeight: 1.8 }}
            >
              <Box component="span" fontWeight={600} color="text.primary">
                {assignment.substituteTeacherName}
              </Box>{" "}
              will replace{" "}
              <Box component="span" fontWeight={600} color="text.primary">
                {assignment.absentTeacherName}
              </Box>
              <br />
              for{" "}
              <Box component="span" fontWeight={500}>
                Period {assignment.periodNo}
              </Box>{" "}
              ({assignment.subject})
              <br />
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 14 }} />
                {formatDate(assignment.date)}
              </Box>
            </Typography>
          </Box>

          {/* Action Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleReturnToTimetable}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              py: 1.5,
            }}
          >
            Return to Timetable
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
