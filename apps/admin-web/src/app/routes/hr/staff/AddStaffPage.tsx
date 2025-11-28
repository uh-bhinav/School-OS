import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  Chip,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCreateStaff, useAllDepartments } from "../../../services/hr.hooks";
import type { StaffCreate, StaffRole, EmploymentStatus } from "../../../services/hr.schema";

const steps = ["Personal Information", "Professional Details", "Qualifications & Documents"];

const staffRoles: StaffRole[] = ["Teaching", "Non-Teaching", "Administration", "Support", "Management"];

const employmentStatuses: EmploymentStatus[] = ["Active", "On Leave", "Inactive", "Contract", "Retired"];

const genderOptions = ["Male", "Female", "Other"] as const;

export function AddStaffPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    profilePicture: "",

    // Professional Details
    employeeId: "",
    departmentId: "",
    role: "" as StaffRole | "",
    designation: "",
    joiningDate: "",
    employmentStatus: "Active" as EmploymentStatus,
    subjects: [] as string[],

    // Qualifications
    qualification: "",
    certifications: [] as string[],
    experienceYears: "",
  });

  const [newSubject, setNewSubject] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const { data: departments = [] } = useAllDepartments();
  const createStaffMutation = useCreateStaff();

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()],
      }));
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject),
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert),
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
      if (!formData.phone.trim()) errors.phone = "Phone is required";
    } else if (step === 1) {
      if (!formData.employeeId.trim()) errors.employeeId = "Employee ID is required";
      if (!formData.departmentId) errors.departmentId = "Department is required";
      if (!formData.role) errors.role = "Role is required";
      if (!formData.designation.trim()) errors.designation = "Designation is required";
      if (!formData.joiningDate) errors.joiningDate = "Joining date is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    const staffData: StaffCreate = {
      employee_id: formData.employeeId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      department_id: formData.departmentId ? parseInt(formData.departmentId) : undefined,
      designation: formData.designation,
      role: formData.role as StaffRole,
      joining_date: formData.joiningDate,
      employment_status: formData.employmentStatus,
      qualification: formData.qualification || undefined,
      subjects: formData.subjects.length > 0 ? formData.subjects : undefined,
      is_active: true,
    };

    try {
      await createStaffMutation.mutateAsync(staffData);
      navigate("/hr/staff");
    } catch (error) {
      console.error("Failed to create staff:", error);
    }
  };

  const renderPersonalInformation = () => (
    <Grid container spacing={3}>
      {/* Profile Picture */}
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={formData.profilePicture}
            sx={{ width: 100, height: 100, bgcolor: "primary.main" }}
          >
            {formData.firstName?.[0]}{formData.lastName?.[0]}
          </Avatar>
          <Box>
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              component="label"
            >
              Upload Photo
              <input type="file" hidden accept="image/*" />
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
              Recommended: 200x200 pixels, Max 2MB
            </Typography>
          </Box>
        </Box>
      </Grid>

      {/* Basic Details */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          error={!!formErrors.firstName}
          helperText={formErrors.firstName}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          error={!!formErrors.lastName}
          helperText={formErrors.lastName}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={!!formErrors.email}
          helperText={formErrors.email}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Phone"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          error={!!formErrors.phone}
          helperText={formErrors.phone}
          required
          InputProps={{
            startAdornment: <InputAdornment position="start">+91</InputAdornment>,
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={formData.gender}
            label="Gender"
            onChange={(e) => handleInputChange("gender", e.target.value)}
          >
            {genderOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Address */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Address</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Street Address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          multiline
          rows={2}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="City"
          value={formData.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="State"
          value={formData.state}
          onChange={(e) => handleInputChange("state", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="Pincode"
          value={formData.pincode}
          onChange={(e) => handleInputChange("pincode", e.target.value)}
        />
      </Grid>

      {/* Emergency Contact */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Emergency Contact</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="Contact Name"
          value={formData.emergencyContactName}
          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="Contact Phone"
          value={formData.emergencyContactPhone}
          onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          fullWidth
          label="Relationship"
          value={formData.emergencyContactRelation}
          onChange={(e) => handleInputChange("emergencyContactRelation", e.target.value)}
        />
      </Grid>
    </Grid>
  );

  const renderProfessionalDetails = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Employee ID"
          value={formData.employeeId}
          onChange={(e) => handleInputChange("employeeId", e.target.value)}
          error={!!formErrors.employeeId}
          helperText={formErrors.employeeId || "e.g., EMP001"}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth error={!!formErrors.departmentId} required>
          <InputLabel>Department</InputLabel>
          <Select
            value={formData.departmentId}
            label="Department"
            onChange={(e) => handleInputChange("departmentId", e.target.value)}
          >
            {departments.map(dept => (
              <MenuItem key={dept.department_id} value={dept.department_id.toString()}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
          {formErrors.departmentId && <FormHelperText>{formErrors.departmentId}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth error={!!formErrors.role} required>
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.role}
            label="Role"
            onChange={(e) => handleInputChange("role", e.target.value)}
          >
            {staffRoles.map(role => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </Select>
          {formErrors.role && <FormHelperText>{formErrors.role}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Designation"
          value={formData.designation}
          onChange={(e) => handleInputChange("designation", e.target.value)}
          error={!!formErrors.designation}
          helperText={formErrors.designation || "e.g., Senior Teacher, Lab Assistant"}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Joining Date"
          type="date"
          value={formData.joiningDate}
          onChange={(e) => handleInputChange("joiningDate", e.target.value)}
          error={!!formErrors.joiningDate}
          helperText={formErrors.joiningDate}
          required
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Employment Status</InputLabel>
          <Select
            value={formData.employmentStatus}
            label="Employment Status"
            onChange={(e) => handleInputChange("employmentStatus", e.target.value)}
          >
            {employmentStatuses.map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Subjects (for Teaching role) */}
      {formData.role === "Teaching" && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Subjects</Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              size="small"
              label="Add Subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddSubject()}
            />
            <Button
              variant="outlined"
              onClick={handleAddSubject}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {formData.subjects.map((subject) => (
              <Chip
                key={subject}
                label={subject}
                onDelete={() => handleRemoveSubject(subject)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>
      )}
    </Grid>
  );

  const renderQualifications = () => (
    <Grid container spacing={3}>
      {/* Qualifications */}
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Highest Qualification"
          value={formData.qualification}
          onChange={(e) => handleInputChange("qualification", e.target.value)}
          placeholder="e.g., M.Sc. Physics, B.Ed."
        />
      </Grid>

      {/* Certifications */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Certifications</Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            size="small"
            label="Add Certification"
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCertification()}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            onClick={handleAddCertification}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {formData.certifications.map((cert) => (
            <Chip
              key={cert}
              label={cert}
              onDelete={() => handleRemoveCertification(cert)}
              color="secondary"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>

      {/* Experience */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Years of Experience"
          value={formData.experienceYears}
          onChange={(e) => handleInputChange("experienceYears", e.target.value)}
          type="number"
          inputProps={{ min: 0 }}
        />
      </Grid>
    </Grid>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPersonalInformation();
      case 1:
        return renderProfessionalDetails();
      case 2:
        return renderQualifications();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/hr/staff")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4">Add New Staff Member</Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the details to enroll a new staff member
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent>
          {getStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/hr/staff")}
              >
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={createStaffMutation.isPending}
                  startIcon={<SaveIcon />}
                >
                  {createStaffMutation.isPending ? "Saving..." : "Save Staff Member"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AddStaffPage;
