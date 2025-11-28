// ============================================================================
// PROXY ASSIGNMENT SUCCESS MODAL COMPONENT
// ============================================================================
// Modal shown after successfully assigning a substitute teacher
// ============================================================================

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Avatar,
  alpha,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { LeaveProxyAssignment } from "../../services/leaveManagement.schema";

interface ProxyAssignmentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  assignment: LeaveProxyAssignment | null;
  onContinue: () => void;
  onFinish: () => void;
  remainingPeriods: number;
  allComplete: boolean;
}

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ProxyAssignmentSuccessModal({
  open,
  onClose,
  assignment,
  onContinue,
  onFinish,
  remainingPeriods,
  allComplete,
}: ProxyAssignmentSuccessModalProps) {
  if (!assignment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Success Header */}
      <Box
        sx={{
          bgcolor: "success.main",
          color: "white",
          p: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: (theme) => alpha(theme.palette.common.white, 0.2),
            mb: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h5" fontWeight={700}>
          Substitute Assigned!
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          The substitute teacher has been successfully assigned
        </Typography>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        {/* Assignment Details */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          {/* Absent Teacher */}
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "warning.main",
                mx: "auto",
                mb: 1,
              }}
            >
              {getInitials(assignment.teacherName)}
            </Avatar>
            <Typography variant="body2" fontWeight={600}>
              {assignment.teacherName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              On Leave
            </Typography>
          </Box>

          {/* Arrow */}
          <ArrowForwardIcon sx={{ color: "success.main", fontSize: 32 }} />

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
            <Typography variant="caption" color="text.secondary">
              Substitute
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Period Info */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            p: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <AccessTimeIcon sx={{ color: "primary.main", mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Period
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {assignment.periodNo} ({assignment.periodTime})
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <SchoolIcon sx={{ color: "primary.main", mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Class
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {assignment.classId}
              {assignment.section}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <PersonIcon sx={{ color: "primary.main", mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              Subject
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {assignment.subject}
            </Typography>
          </Box>
        </Box>

        {/* Status Message */}
        {allComplete ? (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <CheckCircleIcon sx={{ color: "success.main", fontSize: 32, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={600} color="success.dark">
              All Proxy Assignments Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All periods for this leave have substitute teachers assigned.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle2" color="warning.dark">
              {remainingPeriods} more period{remainingPeriods !== 1 ? "s" : ""} need substitute
              teachers
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          {allComplete ? (
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              onClick={onFinish}
              sx={{ fontWeight: 600 }}
            >
              Return to Leave Management
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={onFinish}
              >
                Finish Later
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={onContinue}
                sx={{ fontWeight: 600 }}
              >
                Continue Assigning
              </Button>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
