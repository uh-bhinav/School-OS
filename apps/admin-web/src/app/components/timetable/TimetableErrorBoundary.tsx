import { Component, ReactNode, ErrorInfo } from "react";
import { Box, Typography, Button, Alert, Paper } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and display errors gracefully
 */
export default class TimetableErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Timetable Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper sx={{ p: 4, m: 2, maxWidth: 600, mx: "auto", mt: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Something went wrong with the timetable
          </Alert>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Oops! The timetable encountered an error
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Don't worry, your data is safe. Try refreshing the page or contact support if the issue persists.
          </Typography>
          {this.state.error && (
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                mb: 3,
                fontFamily: "monospace",
                fontSize: "0.875rem",
                overflow: "auto",
              }}
            >
              {this.state.error.message}
            </Box>
          )}
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
            size="large"
          >
            Refresh Page
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}
