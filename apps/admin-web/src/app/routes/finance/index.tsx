// ============================================================================
// FILE: src/app/routes/finance/index.tsx
// PURPOSE: Finance Module Hub - Navigation to all finance pages
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  CategoryOutlined,
  AssignmentOutlined,
  LocalOfferOutlined,
  SettingsOutlined,
  SchoolOutlined,
  DiscountOutlined,
} from "@mui/icons-material";
import {
  useInvoicesList,
  usePaymentsList,
  useFeeComponentsList,
  useGenerateInvoice,
  useCreateFeeComponent,
} from "../../services/fees.hooks";
import { useAuthStore } from "../../stores/useAuthStore";
import type { InvoiceCreate, FeeComponentCreate } from "../../services/fees.api";

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const invoiceStatusConfig = {
  pending: { color: "warning" as const, label: "Pending" },
  paid: { color: "success" as const, label: "Paid" },
  partially_paid: { color: "info" as const, label: "Partially Paid" },
  overdue: { color: "error" as const, label: "Overdue" },
  cancelled: { color: "default" as const, label: "Cancelled" },
};

const paymentStatusConfig = {
  pending: { color: "warning" as const, label: "Pending" },
  processing: { color: "info" as const, label: "Processing" },
  completed: { color: "success" as const, label: "Completed" },
  failed: { color: "error" as const, label: "Failed" },
  refunded: { color: "default" as const, label: "Refunded" },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FeeManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [feeComponentDialogOpen, setFeeComponentDialogOpen] = useState(false);

  const currentAcademicYearId = useAuthStore((state) => state.currentAcademicYearId);

  const [invoiceForm, setInvoiceForm] = useState<InvoiceCreate>({
    student_id: 0,
    academic_year_id: currentAcademicYearId || 0,
    amount: 0,
    due_date: "",
  });

  const [feeComponentForm, setFeeComponentForm] = useState<FeeComponentCreate>({
    name: "",
    amount: 0,
    is_mandatory: true,
  });

  // Queries
  const { data: invoices, isLoading: invoicesLoading } = useInvoicesList({ page_size: 50 });
  const { data: payments, isLoading: paymentsLoading } = usePaymentsList({ page_size: 50 });
  const { data: feeComponents, isLoading: feeComponentsLoading } = useFeeComponentsList();

  // Mutations
  const generateInvoiceMutation = useGenerateInvoice();
  const createFeeComponentMutation = useCreateFeeComponent();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleGenerateInvoice = async () => {
    try {
      await generateInvoiceMutation.mutateAsync(invoiceForm);
      setInvoiceDialogOpen(false);
      setInvoiceForm({
        student_id: 0,
        academic_year_id: currentAcademicYearId || 0,
        amount: 0,
        due_date: "",
      });
    } catch (err) {
      console.error("Failed to generate invoice:", err);
    }
  };

  const handleCreateFeeComponent = async () => {
    try {
      await createFeeComponentMutation.mutateAsync(feeComponentForm);
      setFeeComponentDialogOpen(false);
      setFeeComponentForm({
        name: "",
        amount: 0,
        is_mandatory: true,
      });
    } catch (err) {
      console.error("Failed to create fee component:", err);
    }
  };

  // ============================================================================
  // RENDER TABS
  // ============================================================================

  const renderInvoicesTab = () => {
    if (invoicesLoading) {
      return (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            All Invoices
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInvoiceDialogOpen(true)}
            sx={{ textTransform: "none" }}
          >
            Generate Invoice
          </Button>
        </Box>

        {invoices && invoices.items && invoices.items.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.items.map((invoice) => (
                  <TableRow key={invoice.invoice_id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.student_name || `Student #${invoice.student_id}`}</TableCell>
                    <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={invoiceStatusConfig[invoice.status].label}
                        color={invoiceStatusConfig[invoice.status].color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box display="flex" justifyContent="center" py={8}>
            <Typography variant="body1" color="text.secondary">
              No invoices found. Click "Generate Invoice" to create one.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderPaymentsTab = () => {
    if (paymentsLoading) {
      return (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Payment History
        </Typography>

        {payments && payments.items && payments.items.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Invoice/Order</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.items.map((payment) => (
                  <TableRow key={payment.payment_id}>
                    <TableCell>#{payment.payment_id}</TableCell>
                    <TableCell>
                      {payment.invoice_id
                        ? `Invoice #${payment.invoice_id}`
                        : payment.order_id
                        ? `Order #${payment.order_id}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{payment.payment_method}</TableCell>
                    <TableCell>
                      <Chip
                        label={paymentStatusConfig[payment.status].label}
                        color={paymentStatusConfig[payment.status].color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.transaction_date
                        ? new Date(payment.transaction_date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box display="flex" justifyContent="center" py={8}>
            <Typography variant="body1" color="text.secondary">
              No payments found.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderFeeComponentsTab = () => {
    if (feeComponentsLoading) {
      return (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Fee Components
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFeeComponentDialogOpen(true)}
            sx={{ textTransform: "none" }}
          >
            New Fee Component
          </Button>
        </Box>

        <Stack spacing={2}>
          {feeComponents && feeComponents.length > 0 ? (
            feeComponents.map((component) => (
              <Card key={component.fee_component_id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {component.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Amount: ₹{component.amount.toLocaleString()}
                        {component.is_mandatory && " • Mandatory"}
                      </Typography>
                    </Box>
                    <Chip
                      label={component.is_mandatory ? "Mandatory" : "Optional"}
                      color={component.is_mandatory ? "primary" : "default"}
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Box display="flex" justifyContent="center" py={8}>
              <Typography variant="body1" color="text.secondary">
                No fee components found. Click "New Fee Component" to create one.
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const navigate = useNavigate();

  const financeModules = [
    {
      title: 'Fee Components',
      description: 'Manage individual fee components (Tuition, Transport, Lab fees, etc.)',
      icon: <CategoryOutlined fontSize="large" />,
      path: '/finance/fee-components',
      color: '#1976d2',
    },
    {
      title: 'Fee Templates',
      description: 'Create and manage fee templates by combining components',
      icon: <AssignmentOutlined fontSize="large" />,
      path: '/finance/fee-templates',
      color: '#2e7d32',
    },
    {
      title: 'Class Mapping',
      description: 'Assign fee templates to classes and manage student assignments',
      icon: <SchoolOutlined fontSize="large" />,
      path: '/finance/class-mapping',
      color: '#ed6c02',
    },
    {
      title: 'Discount Rules',
      description: 'Create and manage discount rules (Merit, Sibling, EWS, etc.)',
      icon: <LocalOfferOutlined fontSize="large" />,
      path: '/finance/discounts',
      color: '#9c27b0',
    },
    {
      title: 'Student Discounts',
      description: 'Assign discount rules to individual students',
      icon: <DiscountOutlined fontSize="large" />,
      path: '/finance/student-discounts',
      color: '#d32f2f',
    },
    {
      title: 'Student Overrides',
      description: 'Override specific fee components for individual students',
      icon: <SettingsOutlined fontSize="large" />,
      path: '/finance/overrides',
      color: '#0288d1',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Finance Module
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete fee management system with templates, discounts, overrides, and invoices
          </Typography>
        </Box>
      </Box>

      {/* Quick Links to Finance Sub-Modules */}
      <Box mb={5}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Links
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {financeModules.map((module) => (
            <Card
              key={module.path}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(module.path)}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ color: module.color }}>{module.icon}</Box>
                    <Typography variant="h6" fontWeight={600}>
                      {module.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<ReceiptIcon />} label="Invoices" iconPosition="start" />
          <Tab icon={<PaymentIcon />} label="Payments" iconPosition="start" />
          <Tab icon={<AccountBalanceIcon />} label="Legacy Fee Components" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderInvoicesTab()}
        {activeTab === 1 && renderPaymentsTab()}
        {activeTab === 2 && renderFeeComponentsTab()}
      </Box>

      {/* Generate Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Invoice</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Student ID"
              type="number"
              fullWidth
              value={invoiceForm.student_id || ""}
              onChange={(e) =>
                setInvoiceForm({ ...invoiceForm, student_id: parseInt(e.target.value) || 0 })
              }
              required
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={invoiceForm.amount || ""}
              onChange={(e) =>
                setInvoiceForm({ ...invoiceForm, amount: parseFloat(e.target.value) || 0 })
              }
              required
            />
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={invoiceForm.due_date}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
              required
            />
            <TextField
              label="Notes (Optional)"
              fullWidth
              multiline
              rows={3}
              value={invoiceForm.notes || ""}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value || undefined })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerateInvoice}
            disabled={generateInvoiceMutation.isPending}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Fee Component Dialog */}
      <Dialog
        open={feeComponentDialogOpen}
        onClose={() => setFeeComponentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Fee Component</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={feeComponentForm.name}
              onChange={(e) => setFeeComponentForm({ ...feeComponentForm, name: e.target.value })}
              required
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={feeComponentForm.amount || ""}
              onChange={(e) =>
                setFeeComponentForm({
                  ...feeComponentForm,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={feeComponentForm.is_mandatory}
                  onChange={(e) =>
                    setFeeComponentForm({ ...feeComponentForm, is_mandatory: e.target.checked })
                  }
                />
              }
              label="Mandatory"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeComponentDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateFeeComponent}
            disabled={createFeeComponentMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
