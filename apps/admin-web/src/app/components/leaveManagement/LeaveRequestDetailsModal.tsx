// ============================================================================
// LEAVE REQUEST DETAILS MODAL COMPONENT
// ============================================================================
// Full detailed view of a leave request with approve/reject actions
// ============================================================================

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import type { LeaveRequest, LeaveStatus, LeaveType } from "../../services/leaveManagement.schema";

interface LeaveRequestDetailsModalProps {
  open: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onApprove: (leaveId: string) => Promise<void>;
  onReject: (leaveId: string, reason: string) => Promise<void>;
  onAssignProxy: (request: LeaveRequest) => void;
  onViewAttachment: (url: string, name: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

// Status chip colors
const getStatusColor = (status: LeaveStatus): "warning" | "success" | "error" => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "warning";
  }
};

// Leave type display names
const getLeaveTypeLabel = (type: LeaveType): string => {
  const labels: Record<LeaveType, string> = {
    CASUAL: "Casual Leave",
    SICK: "Sick Leave",
    EMERGENCY: "Emergency Leave",
    MATERNITY: "Maternity Leave",
    PATERNITY: "Paternity Leave",
    NATIONAL_DUTY: "National Duty Leave",
    SCHOOL_EVENT: "School Event",
    PERSONAL: "Personal Leave",
    STUDY: "Study Leave",
    BEREAVEMENT: "Bereavement Leave",
  };
  return labels[type] || type;
};

// Leave type colors
const getLeaveTypeColor = (type: LeaveType): string => {
  const colors: Record<LeaveType, string> = {
    CASUAL: "#2196f3",
    SICK: "#f44336",
    EMERGENCY: "#ff5722",
    MATERNITY: "#e91e63",
    PATERNITY: "#9c27b0",
    NATIONAL_DUTY: "#673ab7",
    SCHOOL_EVENT: "#3f51b5",
    PERSONAL: "#00bcd4",
    STUDY: "#4caf50",
    BEREAVEMENT: "#607d8b",
  };
  return colors[type] || "#9e9e9e";
};

// Format date for display
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Format datetime for display
const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function LeaveRequestDetailsModal({
  open,
  onClose,
  request,
  onApprove,
  onReject,
  onAssignProxy,
  onViewAttachment,
  isApproving,
  isRejecting,
}: LeaveRequestDetailsModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!request) return null;

  const handleApprove = async () => {
    await onApprove(request.leaveId);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    await onReject(request.leaveId, rejectionReason);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  const handleClose = () => {
    setShowRejectForm(false);
    setRejectionReason("");
    onClose();
  };

  const isPending = request.status === "PENDING";
  const isApproved = request.status === "APPROVED";
  const needsProxy = isApproved && !request.proxyAssigned;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Leave Request Details
          </Typography>
          <Chip
            label={request.status}
            size="small"
            color={getStatusColor(request.status)}
            sx={{ fontWeight: 600 }}
          />
          {isApproved && request.proxyAssigned && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Proxy Assigned"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pt: 3 }}>
        {/* Teacher Profile Card */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "primary.main",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            {getInitials(request.teacherName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {request.teacherName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {request.subject} Teacher
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <BadgeIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {request.employeeCode}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EmailIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {request.teacherEmail}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                <Typography variant="caption" color="text.secondary">
                  {request.teacherPhone}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Leave Details Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
          {/* Leave Dates */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <CalendarTodayIcon sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Leave Period
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(request.fromDate)}
            </Typography>
            {request.fromDate !== request.toDate && (
              <Typography variant="body1" fontWeight={500}>
                to {formatDate(request.toDate)}
              </Typography>
            )}
            <Chip
              label={`${request.totalDays} day${request.totalDays !== 1 ? "s" : ""}`}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Leave Type */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <AccessTimeIcon sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Leave Type
              </Typography>
            </Box>
            <Chip
              label={getLeaveTypeLabel(request.leaveType)}
              sx={{
                bgcolor: alpha(getLeaveTypeColor(request.leaveType), 0.1),
                color: getLeaveTypeColor(request.leaveType),
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Reason */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <DescriptionIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={600}>
              Reason for Leave
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {request.reasonSummary}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {request.reasonDescription}
          </Typography>
        </Box>

        {/* Attachment */}
        {request.attachmentUrl && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AttachFileIcon sx={{ color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Attachment
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {request.attachmentName || "Medical Certificate / Document"}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                onViewAttachment(request.attachmentUrl!, request.attachmentName || "Attachment")
              }
            >
              View
            </Button>
          </Box>
        )}

        {/* Approval/Rejection Info */}
        {request.status === "APPROVED" && request.approvedBy && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Approved by:</strong> {request.approvedBy}
              <br />
              <strong>Approved at:</strong> {formatDateTime(request.approvedAt!)}
            </Typography>
          </Alert>
        )}

        {request.status === "REJECTED" && request.rejectedBy && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Rejected by:</strong> {request.rejectedBy}
              <br />
              <strong>Rejected at:</strong> {formatDateTime(request.rejectedAt!)}
              <br />
              <strong>Reason:</strong> {request.rejectionReason}
            </Typography>
          </Alert>
        )}

        {/* Rejection Form */}
        {showRejectForm && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Rejection Reason
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isRejecting}
                startIcon={isRejecting ? <CircularProgress size={18} color="inherit" /> : <CancelIcon />}
              >
                Confirm Rejection
              </Button>
            </Box>
          </Box>
        )}

        {/* Proxy Assignment Notice */}
        {needsProxy && (
          <Alert
            severity="info"
            sx={{ mt: 2 }}
            action={
              <Button
                color="primary"
                size="small"
                variant="contained"
                onClick={() => onAssignProxy(request)}
                startIcon={<PersonSearchIcon />}
              >
                Assign Proxy Teachers
              </Button>
            }
          >
            <Typography variant="body2">
              This leave has been approved but substitute teachers have not been assigned yet.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Close
        </Button>

        {isPending && !showRejectForm && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setShowRejectForm(true)}
              startIcon={<CancelIcon />}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={isApproving}
              startIcon={isApproving ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
            >
              Approve Leave
            </Button>
          </>
        )}

        {isApproved && !request.proxyAssigned && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAssignProxy(request)}
            startIcon={<PersonSearchIcon />}
          >
            Assign Substitute Teachers
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
