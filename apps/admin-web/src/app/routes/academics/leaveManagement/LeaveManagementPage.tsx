// ============================================================================
// LEAVE MANAGEMENT PAGE
// ============================================================================
// Main page for Leave Management with KPIs, leave request table, and actions
// Route: /academics/leave-management
// ============================================================================

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import LeaveManagementKPI from "../../../components/leaveManagement/LeaveManagementKPI";
import LeaveRequestTable from "../../../components/leaveManagement/LeaveRequestTable";
import LeaveRequestDetailsModal from "../../../components/leaveManagement/LeaveRequestDetailsModal";
import LeaveAttachmentViewer from "../../../components/leaveManagement/LeaveAttachmentViewer";
import {
  useLeaveRequests,
  useLeaveKPIs,
  useApproveLeave,
  useRejectLeave,
} from "../../../services/leaveManagement.hooks";
import { useLeaveManagementStore } from "../../../stores/useLeaveManagementStore";
import type { LeaveRequest } from "../../../services/leaveManagement.schema";

export default function LeaveManagementPage() {
  const navigate = useNavigate();

  // Zustand store
  const {
    currentLeaveRequest,
    isDetailsModalOpen,
    isAttachmentViewerOpen,
    openDetailsModal,
    closeDetailsModal,
    openAttachmentViewer,
    closeAttachmentViewer,
    setCurrentLeaveRequest,
  } = useLeaveManagementStore();

  // Local state
  const [attachmentInfo, setAttachmentInfo] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  // React Query hooks
  const { data: leaveRequests = [], isLoading: isLoadingRequests } = useLeaveRequests();
  const { data: kpis, isLoading: isLoadingKpis } = useLeaveKPIs();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  // Handle view request
  const handleViewRequest = useCallback(
    (request: LeaveRequest) => {
      openDetailsModal(request);
    },
    [openDetailsModal]
  );

  // Handle approve leave
  const handleApproveLeave = useCallback(
    async (leaveId: string) => {
      try {
        await approveMutation.mutateAsync({
          leaveId,
          approvedBy: "Admin User", // In production, get from auth store
        });

        setSnackbar({
          open: true,
          message: "Leave request approved successfully!",
          severity: "success",
        });

        // Update current request in store
        if (currentLeaveRequest?.leaveId === leaveId) {
          setCurrentLeaveRequest({
            ...currentLeaveRequest,
            status: "APPROVED",
            approvedBy: "Admin User",
            approvedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to approve leave request",
          severity: "error",
        });
      }
    },
    [approveMutation, currentLeaveRequest, setCurrentLeaveRequest]
  );

  // Handle reject leave
  const handleRejectLeave = useCallback(
    async (leaveId: string, reason: string) => {
      try {
        await rejectMutation.mutateAsync({
          leaveId,
          rejectedBy: "Admin User", // In production, get from auth store
          rejectionReason: reason,
        });

        setSnackbar({
          open: true,
          message: "Leave request rejected",
          severity: "info",
        });

        closeDetailsModal();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to reject leave request",
          severity: "error",
        });
      }
    },
    [rejectMutation, closeDetailsModal]
  );

  // Handle assign proxy - navigate to proxy assignment page
  const handleAssignProxy = useCallback(
    (request: LeaveRequest) => {
      closeDetailsModal();
      navigate(`/academics/leave-management/${request.leaveId}/assign-proxy`);
    },
    [navigate, closeDetailsModal]
  );

  // Handle view attachment
  const handleViewAttachment = useCallback(
    (url: string, name: string) => {
      setAttachmentInfo({ url, name });
      openAttachmentViewer();
    },
    [openAttachmentViewer]
  );

  // Handle close attachment viewer
  const handleCloseAttachmentViewer = useCallback(() => {
    closeAttachmentViewer();
    setAttachmentInfo(null);
  }, [closeAttachmentViewer]);

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: "grid", gap: 3, pb: 4 }}>
      {/* Page Header */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <EventBusyIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Leave Management
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Review and manage staff leave requests, approve leaves, and assign substitute teachers
        </Typography>
      </Box>

      {/* KPI Cards */}
      <LeaveManagementKPI kpis={kpis} loading={isLoadingKpis} />

      {/* Leave Requests Table */}
      <LeaveRequestTable
        requests={leaveRequests}
        loading={isLoadingRequests}
        onViewRequest={handleViewRequest}
      />

      {/* Leave Request Details Modal */}
      <LeaveRequestDetailsModal
        open={isDetailsModalOpen}
        onClose={closeDetailsModal}
        request={currentLeaveRequest}
        onApprove={handleApproveLeave}
        onReject={handleRejectLeave}
        onAssignProxy={handleAssignProxy}
        onViewAttachment={handleViewAttachment}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />

      {/* Attachment Viewer */}
      <LeaveAttachmentViewer
        open={isAttachmentViewerOpen}
        onClose={handleCloseAttachmentViewer}
        attachmentUrl={attachmentInfo?.url}
        attachmentName={attachmentInfo?.name}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
