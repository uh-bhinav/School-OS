// apps/admin-web/src/app/components/finance/BulkInvoiceWizard.tsx
/**
 * Bulk Invoice Generation Wizard
 * Follows: Fee Components → Fee Templates → Class Assignment → Student Overrides → Invoice Generation
 * Ensures safe, explainable, and auditable invoice generation
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  FormControlLabel,
  Stack,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { wizardFeeTemplateService } from '../../services/finance/fee-templates';
import FeeReceipt from './FeeReceipt';
import type { 
  WizardFeeTemplate, 
  ClassFeeMapping, 
  BulkInvoicePreview 
} from '../../services/finance/types';

interface Student {
  id: number;
  name: string;
  rollNo: string;
  class: string;
  defaultAmount: number;
}

interface StudentOverride {
  student_id: number;
  override_type: 'discount' | 'custom_amount' | 'scholarship';
  discount_percentage?: number;
  custom_amount?: number;
  reason: string;
}

interface BulkInvoiceWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = [
  'Select Fee Template',
  'Choose Classes',
  'Student Overrides',
  'Set Due Date',
  'Review & Preview',
  'Generate',
];

export default function BulkInvoiceWizard({ open, onClose, onSuccess }: BulkInvoiceWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  // Step 1: Fee Template Selection
  const [feeTemplates, setFeeTemplates] = useState<WizardFeeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WizardFeeTemplate | null>(null);

  // Step 2: Class Selection
  const [availableClasses, setAvailableClasses] = useState<ClassFeeMapping[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  // Step 3: Student Overrides
  const [students, setStudents] = useState<Student[]>([]);
  const [studentOverrides, setStudentOverrides] = useState<Map<number, StudentOverride>>(new Map());
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Step 4: Due Date
  const [dueDate, setDueDate] = useState<string>('');
  const [suggestedDueDate, setSuggestedDueDate] = useState<string>('');

  // Step 5: Preview
  const [preview, setPreview] = useState<BulkInvoicePreview | null>(null);

  useEffect(() => {
    if (open) {
      loadFeeTemplates();
      resetWizard();
    }
  }, [open]);

  const resetWizard = () => {
    setActiveStep(0);
    setSelectedTemplate(null);
    setSelectedClasses([]);
    setDueDate('');
    setPreview(null);
    setError('');
    setShowReceipt(false);
  };

  const loadFeeTemplates = async () => {
    try {
      setLoading(true);
      const templates = await wizardFeeTemplateService.getAll();
      setFeeTemplates(templates);
    } catch (err) {
      setError('Failed to load fee templates');
    } finally {
      setLoading(false);
    }
  };

  const loadClassesForTemplate = async (templateId: number) => {
    try {
      setLoading(true);
      const classes = await wizardFeeTemplateService.getClassMappings(templateId);
      setAvailableClasses(classes);
      
      // Calculate suggested due date (30 days from now by default)
      const suggested = new Date();
      suggested.setDate(suggested.getDate() + 30);
      setSuggestedDueDate(suggested.toISOString().split('T')[0]);
      setDueDate(suggested.toISOString().split('T')[0]);
    } catch (err) {
      setError('Failed to load class mappings');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalStudents = (classIds: number[]) => {
    const total = availableClasses
      .filter(c => classIds.includes(c.class_id))
      .reduce((sum, c) => sum + c.student_count, 0);
    setTotalStudents(total);
  };

  const handleTemplateSelect = async (template: WizardFeeTemplate) => {
    setSelectedTemplate(template);
    await loadClassesForTemplate(template.template_id);
    setActiveStep(1);
  };

  const handleClassToggle = (classId: number) => {
    const newSelection = selectedClasses.includes(classId)
      ? selectedClasses.filter(id => id !== classId)
      : [...selectedClasses, classId];
    
    setSelectedClasses(newSelection);
    calculateTotalStudents(newSelection);
  };

  const handleSelectAllClasses = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([]);
      setTotalStudents(0);
    } else {
      const allIds = availableClasses.map(c => c.class_id);
      setSelectedClasses(allIds);
      calculateTotalStudents(allIds);
    }
  };

  const loadStudentsForClasses = () => {
    // Generate demo students based on selected classes
    const demoStudents: Student[] = [];
    let studentIdCounter = 1;
    
    selectedClasses.forEach(classId => {
      const classInfo = availableClasses.find(c => c.class_id === classId);
      if (classInfo) {
        const studentCount = classInfo.student_count;
        for (let i = 1; i <= studentCount; i++) {
          demoStudents.push({
            id: studentIdCounter,
            name: `Student ${studentIdCounter}`,
            rollNo: `${classInfo.class_name.replace(/\s/g, '')}-${String(i).padStart(3, '0')}`,
            class: classInfo.class_name,
            defaultAmount: selectedTemplate?.total_amount || 0,
          });
          studentIdCounter++;
        }
      }
    });
    
    setStudents(demoStudents);
  };

  const handleAddOverride = (studentId: number, override: StudentOverride) => {
    const newOverrides = new Map(studentOverrides);
    newOverrides.set(studentId, override);
    setStudentOverrides(newOverrides);
    setSelectedStudentId(null);
  };

  const handleRemoveOverride = (studentId: number) => {
    const newOverrides = new Map(studentOverrides);
    newOverrides.delete(studentId);
    setStudentOverrides(newOverrides);
  };

  const getStudentFinalAmount = (student: Student): number => {
    const override = studentOverrides.get(student.id);
    if (!override) return student.defaultAmount;
    
    if (override.override_type === 'custom_amount' && override.custom_amount) {
      return override.custom_amount;
    } else if (override.discount_percentage) {
      return student.defaultAmount * (1 - override.discount_percentage / 100);
    }
    return student.defaultAmount;
  };

  const handleGeneratePreview = async () => {
    try {
      setLoading(true);
      const previewData = await wizardFeeTemplateService.generatePreview({
        template_id: selectedTemplate!.template_id,
        class_ids: selectedClasses,
        due_date: dueDate,
      });
      setPreview(previewData);
      setActiveStep(4);
    } catch (err) {
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoices = async () => {
    try {
      setLoading(true);
      await wizardFeeTemplateService.generateBulkInvoices({
        template_id: selectedTemplate!.template_id,
        class_ids: selectedClasses,
        due_date: dueDate,
      });
      setShowReceipt(true);
      setActiveStep(5);
    } catch (err) {
      setError('Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishBill = () => {
    onSuccess();
    onClose();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNext = () => {
    if (activeStep === 1 && selectedClasses.length > 0) {
      loadStudentsForClasses();
      setActiveStep(2);
    } else if (activeStep === 2) {
      setActiveStep(3);
    } else if (activeStep === 3) {
      handleGeneratePreview();
    } else if (activeStep === 4) {
      setActiveStep(5);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError('');
  };

  const getDueDateWarning = () => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return { severity: 'error', message: 'Due date is less than 7 days away - parents may not have enough time to pay!' };
    } else if (diffDays < 15) {
      return { severity: 'warning', message: 'Due date is less than 15 days away - consider extending the deadline.' };
    } else if (diffDays > 90) {
      return { severity: 'info', message: 'Due date is more than 90 days away - invoices may be forgotten.' };
    }
    return null;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Fee Template</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose the fee template that contains the components you want to bill.
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : feeTemplates.length === 0 ? (
              <Alert severity="warning">
                No fee templates found. Please create a fee template first before generating invoices.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {feeTemplates.map((template) => (
                  <Card
                    key={template.template_id}
                    sx={{
                      cursor: 'pointer',
                      border: 2,
                      borderColor: selectedTemplate?.template_id === template.template_id ? 'primary.main' : 'divider',
                      '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {template.template_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {template.description}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={1}>
                            <Chip label={template.frequency} size="small" color="primary" />
                            <Chip label={template.academic_period} size="small" />
                            <Chip label={`${template.components.length} components`} size="small" variant="outlined" />
                          </Stack>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          ₹{template.total_amount.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>Included Fee Components:</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {template.components.map((comp) => (
                          <Chip
                            key={comp.component_id}
                            label={`${comp.component_name} - ₹${comp.amount.toLocaleString()}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Classes</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose which classes to generate invoices for.
            </Typography>

            {selectedTemplate && (
              <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Selected Template: {selectedTemplate.template_name}
                </Typography>
                <Typography variant="caption">
                  {selectedTemplate.frequency} | {selectedTemplate.academic_period} | ₹{selectedTemplate.total_amount.toLocaleString()} per student
                </Typography>
              </Alert>
            )}

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedClasses.length === availableClasses.length && availableClasses.length > 0}
                    indeterminate={selectedClasses.length > 0 && selectedClasses.length < availableClasses.length}
                    onChange={handleSelectAllClasses}
                  />
                }
                label="Select All Classes"
              />
              <Typography variant="body2" fontWeight="bold">
                {totalStudents} students selected
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Select</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell align="right">Students</TableCell>
                    <TableCell>Fee Template</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableClasses.map((classMapping) => (
                    <TableRow
                      key={classMapping.class_id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleClassToggle(classMapping.class_id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selectedClasses.includes(classMapping.class_id)} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {classMapping.class_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={classMapping.student_count} size="small" />
                      </TableCell>
                      <TableCell>
                        {classMapping.has_template_mapping ? (
                          <Chip label="Mapped" color="success" size="small" />
                        ) : (
                          <Chip label="Default" color="warning" size="small" icon={<WarningIcon />} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          ₹{(selectedTemplate!.total_amount * classMapping.student_count).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedClasses.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Please select at least one class to continue.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Student Overrides (Optional)</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Apply discounts, scholarships, or custom amounts for individual students.
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>{students.length} students</strong> will receive invoices. 
                {studentOverrides.size > 0 && ` ${studentOverrides.size} override(s) applied.`}
              </Typography>
            </Alert>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" fontWeight="bold">
                Student List
              </Typography>
              {studentOverrides.size > 0 && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => setStudentOverrides(new Map())}
                >
                  Clear All Overrides
                </Button>
              )}
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Roll No</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell align="right">Original Amount</TableCell>
                    <TableCell align="right">Final Amount</TableCell>
                    <TableCell>Override</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const override = studentOverrides.get(student.id);
                    const finalAmount = getStudentFinalAmount(student);
                    const hasDiscount = finalAmount < student.defaultAmount;

                    return (
                      <TableRow key={student.id} hover>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={override ? 'bold' : 'normal'}>
                            {student.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            sx={{ textDecoration: hasDiscount ? 'line-through' : 'none', color: hasDiscount ? 'text.secondary' : 'inherit' }}
                          >
                            ₹{student.defaultAmount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={hasDiscount ? 'success.main' : 'inherit'}
                          >
                            ₹{finalAmount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {override ? (
                            <Chip
                              label={
                                override.override_type === 'discount'
                                  ? `${override.discount_percentage}% off`
                                  : override.override_type === 'scholarship'
                                  ? `Scholarship ${override.discount_percentage}%`
                                  : `Custom ₹${override.custom_amount}`
                              }
                              size="small"
                              color="success"
                              onDelete={() => handleRemoveOverride(student.id)}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">None</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant={override ? 'outlined' : 'contained'}
                            onClick={() => setSelectedStudentId(student.id)}
                          >
                            {override ? 'Edit' : 'Add Override'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Override Dialog */}
            <Dialog open={selectedStudentId !== null} onClose={() => setSelectedStudentId(null)} maxWidth="sm" fullWidth>
              <DialogTitle>
                Add/Edit Override
                {selectedStudentId && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {students.find(s => s.id === selectedStudentId)?.name}
                  </Typography>
                )}
              </DialogTitle>
              <DialogContent>
                <OverrideForm
                  studentId={selectedStudentId!}
                  defaultAmount={students.find(s => s.id === selectedStudentId)?.defaultAmount || 0}
                  existingOverride={selectedStudentId ? studentOverrides.get(selectedStudentId) : undefined}
                  onSave={handleAddOverride}
                  onCancel={() => setSelectedStudentId(null)}
                />
              </DialogContent>
            </Dialog>
          </Box>
        );

      case 3:
        const dueDateWarning = getDueDateWarning();
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Set Due Date</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose when parents should pay by.
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Suggested Due Date (based on template rules)</Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={suggestedDueDate}
                  disabled
                  InputLabelProps={{ shrink: true }}
                  helperText="Automatically calculated based on fee template frequency"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Set Custom Due Date</Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="You can override the suggested date if needed"
                />
              </Box>

              {dueDateWarning && (
                <Alert severity={dueDateWarning.severity as any}>
                  {dueDateWarning.message}
                </Alert>
              )}

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Invoice Summary</Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Classes Selected:</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedClasses.length}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Students:</Typography>
                      <Typography variant="body2" fontWeight="bold">{totalStudents}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Amount per Student:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{selectedTemplate?.total_amount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" fontWeight="bold">Estimated Total:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        ₹{((selectedTemplate?.total_amount || 0) * totalStudents).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review & Preview</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Review all details before generating invoices. No invoices will be created until you confirm.
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : preview ? (
              <Stack spacing={3}>
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  Preview generated successfully. {preview.total_invoices} invoices ready to be created.
                </Alert>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">Fee Template Details</Typography>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Template:</Typography>
                        <Typography variant="body2" fontWeight="bold">{selectedTemplate?.template_name}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Frequency:</Typography>
                        <Typography variant="body2">{selectedTemplate?.frequency}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Academic Period:</Typography>
                        <Typography variant="body2">{selectedTemplate?.academic_period}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Due Date:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {new Date(dueDate).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">Components Included</Typography>
                    <List dense>
                      {selectedTemplate?.components.map((comp) => (
                        <ListItem key={comp.component_id}>
                          <ListItemText
                            primary={comp.component_name}
                            secondary={comp.description || comp.category || 'General'}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            ₹{comp.amount.toLocaleString()}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">Invoice Generation Summary</Typography>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Total Invoices:</Typography>
                        <Typography variant="body2" fontWeight="bold">{preview.total_invoices}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Students with Overrides:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {preview.students_with_overrides}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Students with Discounts:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {preview.students_with_discounts}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold">Expected Total Amount:</Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary.main">
                          ₹{preview.total_amount_min.toLocaleString()} - ₹{preview.total_amount_max.toLocaleString()}
                        </Typography>
                      </Box>
                      {preview.total_amount_min !== preview.total_amount_max && (
                        <Typography variant="caption" color="text.secondary">
                          Range due to student-specific overrides and discounts
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {preview.warnings && preview.warnings.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="subtitle2" gutterBottom>Warnings:</Typography>
                    <List dense>
                      {preview.warnings.map((warning, idx) => (
                        <ListItem key={idx}>
                          <Typography variant="caption">{warning}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}
              </Stack>
            ) : null}
          </Box>
        );

      case 5:
        if (showReceipt && selectedTemplate) {
          // Show the generated receipt
          const today = new Date();
          const receiptNo = `INV-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`;
          const receiptDate = today.toLocaleDateString('en-GB');
          
          return (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Invoices Generated Successfully!
                </Typography>
                <Typography variant="body2">
                  {preview?.total_invoices} invoice(s) have been created. Below is a sample receipt.
                </Typography>
              </Alert>

              <Box sx={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
                <FeeReceipt
                  receiptNo={receiptNo}
                  receiptDate={receiptDate}
                  studentName="SAMPLE STUDENT"
                  registrationNo="2024-SAMPLE-001"
                  academicBatch="2024-2025"
                  degree="[Degree/Program]"
                  branch="[Branch/Section]"
                  year="[Year]"
                  financialYear="2024-2025"
                  feeComponents={selectedTemplate.components}
                  totalAmount={selectedTemplate.total_amount}
                  paymentMode="Online Payment"
                  bankDetails=""
                  remarks="Bulk Invoice Generation - Student Online Payment"
                />
              </Box>
            </Box>
          );
        }

        return (
          <Box textAlign="center" py={4}>
            <AssessmentIcon sx={{ fontSize: 80, color: loading ? 'action.disabled' : 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              {loading ? 'Generating Invoices...' : 'Ready to Generate'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {loading 
                ? 'Please wait while we create invoices for all selected students.'
                : `Click "Generate Invoices" to create ${preview?.total_invoices} invoices.`
              }
            </Typography>
            {loading && <CircularProgress sx={{ mt: 2 }} />}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <AssessmentIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">Generate Bulk Invoices</Typography>
            <Typography variant="caption" color="text.secondary">
              Safe, explainable, and auditable invoice generation
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {showReceipt && activeStep === 5 ? (
          <>
            <Button onClick={handlePrintReceipt} startIcon={<PrintIcon />} variant="outlined">
              Print Receipt
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              onClick={handlePublishBill}
              startIcon={<CloudUploadIcon />}
              color="success"
              size="large"
            >
              Publish Bill
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={loading}>Cancel</Button>
            {activeStep > 0 && activeStep < 5 && (
              <Button onClick={handleBack} disabled={loading}>Back</Button>
            )}
            {activeStep > 0 && activeStep < 4 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  loading ||
                  (activeStep === 1 && selectedClasses.length === 0) ||
                  (activeStep === 3 && !dueDate)
                }
              >
                Next
              </Button>
            )}
            {activeStep === 4 && !showReceipt && (
              <Button
                variant="contained"
                onClick={handleGenerateInvoices}
                disabled={loading}
                color="success"
              >
                Generate Invoices
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Override Form Component
interface OverrideFormProps {
  studentId: number;
  defaultAmount: number;
  existingOverride?: StudentOverride;
  onSave: (studentId: number, override: StudentOverride) => void;
  onCancel: () => void;
}

function OverrideForm({ studentId, defaultAmount, existingOverride, onSave, onCancel }: OverrideFormProps) {
  const [overrideType, setOverrideType] = useState<'discount' | 'custom_amount' | 'scholarship'>(
    existingOverride?.override_type || 'discount'
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    existingOverride?.discount_percentage?.toString() || ''
  );
  const [customAmount, setCustomAmount] = useState(
    existingOverride?.custom_amount?.toString() || ''
  );
  const [reason, setReason] = useState(existingOverride?.reason || '');

  const handleSave = () => {
    const override: StudentOverride = {
      student_id: studentId,
      override_type: overrideType,
      reason,
    };

    if (overrideType === 'custom_amount') {
      override.custom_amount = parseFloat(customAmount);
    } else {
      override.discount_percentage = parseFloat(discountPercentage);
    }

    onSave(studentId, override);
  };

  const isValid = reason.trim().length > 0 && 
    (overrideType === 'custom_amount' ? parseFloat(customAmount) > 0 : parseFloat(discountPercentage) > 0);

  return (
    <Stack spacing={3} sx={{ pt: 2 }}>
      <TextField
        select
        label="Override Type"
        value={overrideType}
        onChange={(e) => setOverrideType(e.target.value as any)}
        fullWidth
      >
        <option value="discount">Discount</option>
        <option value="scholarship">Scholarship</option>
        <option value="custom_amount">Custom Amount</option>
      </TextField>

      {overrideType === 'custom_amount' ? (
        <TextField
          label="Custom Amount"
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: '₹',
          }}
          helperText={`Original amount: ₹${defaultAmount.toLocaleString()}`}
        />
      ) : (
        <TextField
          label={overrideType === 'scholarship' ? 'Scholarship Percentage' : 'Discount Percentage'}
          type="number"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: '%',
          }}
          helperText={`Final amount: ₹${(defaultAmount * (1 - parseFloat(discountPercentage || '0') / 100)).toLocaleString()}`}
        />
      )}

      <TextField
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        fullWidth
        multiline
        rows={2}
        placeholder="e.g., Merit scholarship, Sibling discount, Financial hardship"
        required
      />

      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid}>
          Save Override
        </Button>
      </Box>
    </Stack>
  );
}

