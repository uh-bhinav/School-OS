// BudgetSettingsPage.tsx - Budget module settings and configuration
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Skeleton,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Approval as ApprovalIcon,
} from "@mui/icons-material";
import {
  useBudgetSettings,
  useUpdateBudgetSettings,
  useApprovalRules,
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "../../../services/budget.hooks";

export default function BudgetSettingsPage() {
  const navigate = useNavigate();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: settingsData, isLoading: settingsLoading } = useBudgetSettings();
  const { data: approvalRulesData, isLoading: rulesLoading } = useApprovalRules();
  const { data: notificationPrefsData, isLoading: notifLoading } = useNotificationPreferences();

  const updateSettingsMutation = useUpdateBudgetSettings();
  const updateNotificationMutation = useUpdateNotificationPreference();

  const settings = (settingsData as any) || {
    fiscalYearStart: "April",
    defaultCurrency: "INR",
    budgetApprovalRequired: true,
    autoApproveThreshold: 5000,
    alertThresholds: {
      warning: 75,
      critical: 90,
    },
    pettyWalletLimit: 50000,
    requireReceiptAbove: 500,
  };

  const approvalRules = (approvalRulesData as any[]) || [
    { id: "1", minAmount: 0, maxAmount: 5000, approverRole: "Department Head" },
    { id: "2", minAmount: 5001, maxAmount: 25000, approverRole: "Finance Manager" },
    { id: "3", minAmount: 25001, maxAmount: 100000, approverRole: "Principal" },
    { id: "4", minAmount: 100001, maxAmount: null, approverRole: "Board" },
  ];

  const notificationPrefs = (notificationPrefsData as any[]) || [
    { event: "budget_threshold_warning", email: true, inApp: true, sms: false },
    { event: "approval_required", email: true, inApp: true, sms: false },
    { event: "approval_processed", email: true, inApp: true, sms: false },
    { event: "transaction_logged", email: false, inApp: true, sms: false },
    { event: "petty_cash_low", email: true, inApp: true, sms: true },
    { event: "monthly_report", email: true, inApp: false, sms: false },
  ];

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSaveSettings = async () => {
    await updateSettingsMutation.mutateAsync(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleNotificationToggle = async (event: string, channel: string, value: boolean) => {
    await updateNotificationMutation.mutateAsync({
      event,
      updates: { [channel]: value },
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "No limit";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isLoading = settingsLoading || rulesLoading || notifLoading;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/finance/budgets")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Budget Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure budget module preferences and rules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">General Settings</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Fiscal Year Start</InputLabel>
                    <Select
                      value={localSettings.fiscalYearStart}
                      label="Fiscal Year Start"
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, fiscalYearStart: e.target.value })
                      }
                    >
                      <MenuItem value="January">January</MenuItem>
                      <MenuItem value="April">April</MenuItem>
                      <MenuItem value="July">July</MenuItem>
                      <MenuItem value="October">October</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Default Currency</InputLabel>
                    <Select
                      value={localSettings.defaultCurrency}
                      label="Default Currency"
                      onChange={(e) =>
                        setLocalSettings({ ...localSettings, defaultCurrency: e.target.value })
                      }
                    >
                      <MenuItem value="INR">INR (₹)</MenuItem>
                      <MenuItem value="USD">USD ($)</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Warning Threshold"
                    type="number"
                    value={localSettings.alertThresholds?.warning || 75}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        alertThresholds: {
                          ...localSettings.alertThresholds,
                          warning: Number(e.target.value),
                        },
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    helperText="Alert when budget reaches this utilization"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Critical Threshold"
                    type="number"
                    value={localSettings.alertThresholds?.critical || 90}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        alertThresholds: {
                          ...localSettings.alertThresholds,
                          critical: Number(e.target.value),
                        },
                      })
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    helperText="Critical alert threshold"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Petty Wallet Limit"
                    type="number"
                    value={localSettings.pettyWalletLimit || 50000}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, pettyWalletLimit: Number(e.target.value) })
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Receipt Required Above"
                    type="number"
                    value={localSettings.requireReceiptAbove || 500}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, requireReceiptAbove: Number(e.target.value) })
                    }
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Approval Settings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <ApprovalIcon color="primary" />
                <Typography variant="h6">Approval Settings</Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.budgetApprovalRequired}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        budgetApprovalRequired: e.target.checked,
                      })
                    }
                  />
                }
                label="Require approval for budget changes"
              />

              <TextField
                fullWidth
                size="small"
                label="Auto-approve threshold"
                type="number"
                value={localSettings.autoApproveThreshold || 5000}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    autoApproveThreshold: Number(e.target.value),
                  })
                }
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText="Transactions below this amount are auto-approved"
                sx={{ mt: 2, mb: 3 }}
              />

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Approval Hierarchy
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Amount Range</TableCell>
                      <TableCell>Approver</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {approvalRules.map((rule: any) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          {formatCurrency(rule.minAmount)} - {formatCurrency(rule.maxAmount)}
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={rule.approverRole} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6">Notification Preferences</Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell align="center">Email</TableCell>
                      <TableCell align="center">In-App</TableCell>
                      <TableCell align="center">SMS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notificationPrefs.map((pref: any) => (
                      <TableRow key={pref.event}>
                        <TableCell>
                          <Typography variant="body2">
                            {pref.event
                              .split("_")
                              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={pref.email}
                            onChange={(e) =>
                              handleNotificationToggle(pref.event, "email", e.target.checked)
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={pref.inApp}
                            onChange={(e) =>
                              handleNotificationToggle(pref.event, "inApp", e.target.checked)
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={pref.sms}
                            onChange={(e) =>
                              handleNotificationToggle(pref.event, "sms", e.target.checked)
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Security & Audit</Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Enable audit logging"
                    secondary="Track all budget-related actions"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Two-factor for large transactions"
                    secondary="Require 2FA for transactions above ₹1,00,000"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="IP-based access control"
                    secondary="Restrict access to approved IP addresses"
                  />
                  <ListItemSecondaryAction>
                    <Switch />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Session timeout"
                    secondary="Auto-logout after 30 minutes of inactivity"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Data Management
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                These actions may take some time to complete
              </Alert>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Export all budget data"
                    secondary="Download complete budget history"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" variant="outlined">
                      Export
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Archive closed budgets"
                    secondary="Move completed fiscal year data to archive"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" variant="outlined">
                      Archive
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Clear demo data"
                    secondary="Remove all sample/demo budget entries"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" variant="outlined" color="error">
                      Clear
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
