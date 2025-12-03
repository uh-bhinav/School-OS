// src/app/routes/auth/login.tsx
/**
 * Modern Login Page Component
 *
 * Features:
 * - Split-screen design with background image
 * - Form validation using Formik + Yup
 * - Responsive mobile layout
 * - Blur overlay for readability
 * - Smooth animations
 */

import { useState } from "react";
import { supabase } from "../../services/supabase";
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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { InlineLoader } from "../../components/AppLoader";
import { useConfigStore } from "../../stores/useConfigStore";

// Validation schema using Yup
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cfg = useConfigStore((s) => s.config);

  const logo = cfg?.branding.logo.primary_url;
  const schoolName = cfg?.identity?.display_name ?? "School OS";
  const primaryColor = cfg?.branding.colors.primary ?? "#E87722";

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setError(null);

      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (authError) {
          setError(authError.message);
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Login error:", err);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image Section - Hidden on mobile */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
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
              background: `linear-gradient(135deg, ${alpha(primaryColor, 0.85)} 0%, ${alpha("#0B5F5A", 0.75)} 100%)`,
              backdropFilter: "blur(3px)",
            },
          }}
        >
          {/* School Logo and Branding */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              px: 6,
              color: "#fff",
            }}
          >
            {logo && (
              <Box
                component="img"
                src={logo}
                alt="School Logo"
                sx={{
                  width: 180,
                  height: 180,
                  objectFit: "contain",
                  mb: 4,
                  filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.2))",
                }}
              />
            )}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                mb: 2,
                textShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {schoolName}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                opacity: 0.95,
                maxWidth: 500,
                textShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              Welcome back! Sign in to access your admin dashboard.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Login Form Section */}
      <Box
        sx={{
          flex: isMobile ? 1 : 0.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          backgroundColor: theme.palette.background.default,
          backgroundImage: isMobile ? "url(/thumbnail.webp)" : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          "&::before": isMobile
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                backdropFilter: "blur(10px)",
              }
            : {},
        }}
      >
        <Paper
          elevation={isMobile ? 8 : 0}
          sx={{
            p: { xs: 3, sm: 5 },
            width: "100%",
            maxWidth: 480,
            position: "relative",
            zIndex: 1,
            backgroundColor: isMobile
              ? alpha(theme.palette.background.paper, 0.98)
              : theme.palette.background.paper,
            backdropFilter: isMobile ? "blur(20px)" : "none",
            borderRadius: 3,
          }}
        >
          {/* Mobile Logo */}
          {isMobile && logo && (
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
                  width: 100,
                  height: 100,
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
                color: theme.palette.text.primary,
              }}
            >
              Sign In
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              Enter your credentials to access your account
            </Typography>
          </Box>

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

          {/* Login Form */}
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={formik.isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={formik.isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={formik.isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting && <InlineLoader />}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                "&:hover": {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {formik.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Links */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                underline="hover"
                sx={{
                  color: primaryColor,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
