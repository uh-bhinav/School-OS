import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button } from "@mui/material";
import { AttachMoney, Receipt, Payment, AccountBalance } from "@mui/icons-material";
import { mockFeesProvider } from "@/app/mockDataProviders";
import type { Invoice } from "@/app/mockDataProviders/mockFees";

interface FeesPanelProps {
  studentId: number;
}

export default function FeesPanel({ studentId }: FeesPanelProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await mockFeesProvider.getInvoices({ student_id: studentId });
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching fees:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <CircularProgress />;
  if (!invoices || invoices.length === 0) {
    return <Alert severity="info">No fee records available</Alert>;
  }

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const pendingAmount = invoices.reduce((sum, inv) => sum + inv.pending_amount, 0);

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PARTIAL":
        return "warning";
      case "OVERDUE":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Fees & Payments
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, mb: 3 }}>
        <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  ₹{totalAmount}
                </Typography>
                <Typography variant="body2">Total Fees</Typography>
              </Box>
              <Receipt sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  ₹{paidAmount}
                </Typography>
                <Typography variant="body2">Paid Amount</Typography>
              </Box>
              <Payment sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            background:
              pendingAmount > 0
                ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                : "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  ₹{pendingAmount}
                </Typography>
                <Typography variant="body2">Pending</Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Invoices List */}
      {invoices.map((invoice) => (
        <Card key={invoice.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {invoice.invoice_number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Due Date: {new Date(invoice.due_date).toLocaleDateString()}
                </Typography>
              </Box>
              <Chip label={invoice.status} color={getStatusColor(invoice.status)} />
            </Box>

            {/* Invoice Items */}
            <Paper sx={{ overflowX: "auto", mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fee Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Final Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.fee_type}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">₹{item.amount}</TableCell>
                      <TableCell align="right">₹{item.discount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        ₹{item.final_amount}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell colSpan={4}>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>₹{invoice.total_amount}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>

            {/* Payment Summary */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ₹{invoice.total_amount}
                </Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "success.light", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Paid Amount
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ₹{invoice.paid_amount}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: invoice.pending_amount > 0 ? "error.light" : "success.light",
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Pending Amount
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ₹{invoice.pending_amount}
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            {invoice.pending_amount > 0 && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" startIcon={<Payment />}>
                  Make Payment
                </Button>
                <Button variant="outlined" startIcon={<AccountBalance />}>
                  Pay in Installments
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
