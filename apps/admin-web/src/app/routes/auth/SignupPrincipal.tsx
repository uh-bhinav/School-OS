// src/app/routes/auth/SignupPrincipal.tsx
/**
 * Modern Principal Signup Page Component
 *
 * Features:
 * - Multi-step form design with warm orange accent
 * - Form validation using Formik + Yup
 * - Background image with blur overlay
 * - Responsive mobile layout
 * - Smooth step transitions
 * - Progress indicator
 */

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  PersonOutlined,
  SchoolOutlined,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";
import { http } from "../../services/http";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { InlineLoader } from "../../components/AppLoader";
import { useConfigStore } from "../../stores/useConfigStore";

// Validation schema for multi-step form
const signupSchema = Yup.object({
  schoolCode: Yup.string()
    .min(3, "School code must be at least 3 characters")
    .required("School code is required"),
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const steps = ["School Info", "Personal Info", "Account Details"];

export default function SignupPrincipal() {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cfg = useConfigStore((s) => s.config);

  const logo = cfg?.branding.logo.primary_url;
  const orangeAccent = "#E87722"; // Warm orange from the RWV inspiration

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      schoolCode: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      setError(null);
      setSuccess(false);

      try {
        await http.post("/onboarding/principal-signup", {
          email: values.email,
          password: values.password,
          name: values.name,
          school_code: values.schoolCode,
        });

        setSuccess(true);
        setTimeout(() => {
          navigate("/auth/login");
        }, 2500);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to create principal account";
        setError(errorMessage);
        console.error("Signup error:", err);
      }
    },
  });

  const handleNext = () => {
    // Validate current step before proceeding
    const currentStepFields = getFieldsForStep(activeStep);
    const hasErrors = currentStepFields.some(
      (field) => formik.touched[field] && formik.errors[field]
    );

    if (hasErrors) {
      currentStepFields.forEach((field) => formik.setFieldTouched(field, true));
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getFieldsForStep = (step: number): (keyof typeof formik.values)[] => {
    switch (step) {
      case 0:
        return ["schoolCode"];
      case 1:
        return ["name", "email"];
      case 2:
        return ["password", "confirmPassword"];
      default:
        return [];
    }
  };

  const isStepValid = (step: number) => {
    const fields = getFieldsForStep(step);
    return fields.every(
      (field) => formik.values[field] && !formik.errors[field]
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundImage: "url(/thumbnail.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(orangeAccent, 0.88)} 0%, ${alpha("#FF6B35", 0.82)} 100%)`,
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 600,
          position: "relative",
          zIndex: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          boxShadow: `0 20px 60px ${alpha("#000", 0.25)}`,
        }}
      >
        {/* Logo */}
        {logo && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="School Logo"
              sx={{
                width: 80,
                height: 80,
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(135deg, ${orangeAccent} 0%, #FF6B35 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Principal Signup
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            Create your admin account to get started
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label.Mui-active": {
                    color: orangeAccent,
                    fontWeight: 600,
                  },
                  "& .MuiStepIcon-root.Mui-active": {
                    color: orangeAccent,
                  },
                  "& .MuiStepIcon-root.Mui-completed": {
                    color: orangeAccent,
                  },
                }}
              >
                {!isMobile && label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Account created successfully! Redirecting to login...
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          {/* Step 0: School Info */}
          {activeStep === 0 && (
            <Box>
              <TextField
                fullWidth
                id="schoolCode"
                name="schoolCode"
                label="School Code"
                autoFocus
                value={formik.values.schoolCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.schoolCode &&
                  Boolean(formik.errors.schoolCode)
                }
                helperText={
                  formik.touched.schoolCode && formik.errors.schoolCode
                }
                disabled={formik.isSubmitting || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolOutlined sx={{ color: orangeAccent }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                Enter your unique school identification code
              </Typography>
            </Box>
          )}

          {/* Step 1: Personal Info */}
          {activeStep === 1 && (
            <Box>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                autoFocus
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={formik.isSubmitting || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined sx={{ color: orangeAccent }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={formik.isSubmitting || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: orangeAccent }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {/* Step 2: Account Details */}
          {activeStep === 2 && (
            <Box>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoFocus
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                disabled={formik.isSubmitting || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: orangeAccent }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={formik.isSubmitting || success}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                disabled={formik.isSubmitting || success}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: orangeAccent }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        disabled={formik.isSubmitting || success}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || formik.isSubmitting || success}
              startIcon={<ArrowBack />}
              sx={{
                borderColor: orangeAccent,
                color: orangeAccent,
                "&:hover": {
                  borderColor: orangeAccent,
                  backgroundColor: alpha(orangeAccent, 0.08),
                },
              }}
            >
              Back
            </Button>

            <Box sx={{ flex: 1 }} />

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  !isStepValid(activeStep) ||
                  formik.isSubmitting ||
                  success
                }
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: orangeAccent,
                  "&:hover": {
                    backgroundColor: "#FF6B35",
                  },
                  boxShadow: `0 4px 12px ${alpha(orangeAccent, 0.4)}`,
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting || success}
                startIcon={formik.isSubmitting && <InlineLoader />}
                sx={{
                  backgroundColor: orangeAccent,
                  "&:hover": {
                    backgroundColor: "#FF6B35",
                  },
                  boxShadow: `0 4px 12px ${alpha(orangeAccent, 0.4)}`,
                  px: 4,
                }}
              >
                {formik.isSubmitting
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            )}
          </Box>
        </form>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              underline="hover"
              sx={{
                color: orangeAccent,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
