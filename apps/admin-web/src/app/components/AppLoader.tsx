// src/app/components/AppLoader.tsx
/**
 * AppLoader Component
 *
 * A beautiful loading screen with animated school logo
 * Uses MUI CircularProgress with fade-in/fade-out animations
 * Can be extended with Lottie animations if needed
 */

import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import { useConfigStore } from '../stores/useConfigStore';
import { useState, useEffect } from 'react';

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function AppLoader({
  message = 'Loading...',
  fullScreen = true
}: AppLoaderProps) {
  const cfg = useConfigStore((s) => s.config);
  const [showLogo, setShowLogo] = useState(true);

  // Subtle fade animation for logo
  useEffect(() => {
    const interval = setInterval(() => {
      setShowLogo((prev) => !prev);
    }, 2000); // Toggle every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const logo = cfg?.branding.logo.primary_url;
  const schoolName = cfg?.identity?.display_name ?? 'School OS';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '100vh' : '400px',
        width: '100%',
        background: fullScreen
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'transparent',
        position: fullScreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        zIndex: fullScreen ? 9999 : 1,
      }}
    >
      {/* Animated Logo */}
      <Fade in={showLogo} timeout={800}>
        <Box
          sx={{
            position: 'relative',
            mb: 3,
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logo && (
            <Box
              component="img"
              src={logo}
              alt="School Logo"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))',
              }}
            />
          )}

          {/* Circular Progress around logo */}
          <CircularProgress
            size={140}
            thickness={2}
            sx={{
              position: 'absolute',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          />
        </Box>
      </Fade>

      {/* Loading Text */}
      <Typography
        variant="h6"
        sx={{
          color: '#fff',
          fontWeight: 500,
          mb: 1,
          textAlign: 'center',
        }}
      >
        {schoolName}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

/**
 * Minimal inline loader for button states
 */
export function InlineLoader({ size = 20 }: { size?: number }) {
  return (
    <CircularProgress
      size={size}
      thickness={3}
      sx={{ color: 'inherit' }}
    />
  );
}
