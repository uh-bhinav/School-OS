// src/app/providers/ThemeProvider.tsx
import { PropsWithChildren, useMemo, createContext, useContext, useState, useCallback } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useConfigStore } from "../stores/useConfigStore";

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeRoot');
  }
  return context;
}

export function ThemeRoot({ children }: PropsWithChildren) {
  const config = useConfigStore((s) => s.config);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => {
    const c = config?.branding.colors ?? {
      primary:"#1976d2", primary_contrast:"#fff", secondary:"#f5f5f5",
      surface:"#fff", surface_variant:"#f1f3f5", error:"#d32f2f",
      success:"#2e7d32", warning:"#ed6c02"
    };

    // VS Code-inspired dark mode colors
    const darkBackground = '#1e1e1e';      // VS Code editor background
    const darkSurface = '#252526';          // VS Code sidebar background
    const darkSurfaceVariant = '#2d2d2d';   // Slightly lighter surface
    const darkBorder = '#3c3c3c';           // VS Code border color
    const darkHover = '#2a2d2e';            // Hover state

    return createTheme({
      palette: {
        mode,
        primary: {
          main: c.primary,
          contrastText: c.primary_contrast,
          light: mode === 'dark' ? '#64b5f6' : '#42a5f5',
          dark: mode === 'dark' ? '#1565c0' : '#0d47a1',
        },
        secondary: {
          main: '#0B5F5A',
          light: '#2d8f87',
          dark: '#064440',
        },
        error: {
          main: c.error,
          light: '#e57373',
          dark: '#c62828',
        },
        success: {
          main: c.success,
          light: '#4caf50',
          dark: '#1b5e20',
        },
        warning: {
          main: c.warning,
          light: '#ff9800',
          dark: '#e65100',
        },
        info: {
          main: '#0288d1',
          light: '#03a9f4',
          dark: '#01579b',
        },
        background: {
          default: mode === 'dark' ? darkBackground : '#fafafa',
          paper: mode === 'dark' ? darkSurface : '#ffffff',
        },
        text: {
          primary: mode === 'dark' ? '#cccccc' : 'rgba(0, 0, 0, 0.87)',
          secondary: mode === 'dark' ? '#9d9d9d' : 'rgba(0, 0, 0, 0.6)',
        },
        divider: mode === 'dark' ? darkBorder : 'rgba(0, 0, 0, 0.12)',
        action: {
          active: mode === 'dark' ? '#cccccc' : 'rgba(0, 0, 0, 0.54)',
          hover: mode === 'dark' ? darkHover : 'rgba(0, 0, 0, 0.04)',
          selected: mode === 'dark' ? '#37373d' : 'rgba(0, 0, 0, 0.08)',
          disabled: mode === 'dark' ? '#5d5d5d' : 'rgba(0, 0, 0, 0.26)',
          disabledBackground: mode === 'dark' ? '#3c3c3c' : 'rgba(0, 0, 0, 0.12)',
        },
      },
      typography: {
        fontFamily: '"Ubuntu", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.01562em',
        },
        h2: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.00833em',
        },
        h3: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 600,
          letterSpacing: '0em',
        },
        h4: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 600,
          letterSpacing: '0.00735em',
        },
        h5: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 500,
          letterSpacing: '0em',
        },
        h6: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 500,
          letterSpacing: '0.0075em',
        },
        subtitle1: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 500,
          letterSpacing: '0.00938em',
        },
        subtitle2: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 500,
          letterSpacing: '0.00714em',
        },
        body1: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 400,
          letterSpacing: '0.00938em',
          lineHeight: 1.6,
        },
        body2: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 400,
          letterSpacing: '0.01071em',
          lineHeight: 1.6,
        },
        button: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 500,
          textTransform: 'none',
          letterSpacing: '0.02857em',
        },
        caption: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 400,
          letterSpacing: '0.03333em',
        },
        overline: {
          fontFamily: '"Ubuntu", sans-serif',
          fontWeight: 500,
          letterSpacing: '0.08333em',
          textTransform: 'uppercase',
        },
      },
      shape: {
        borderRadius: (config?.branding.layout.corner_style === "square" ? 4 : 12)
      },
      shadows: [
        'none',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 6px 12px rgba(0,0,0,0.1)',
        '0px 8px 16px rgba(0,0,0,0.12)',
        '0px 10px 20px rgba(0,0,0,0.14)',
        '0px 12px 24px rgba(0,0,0,0.16)',
        '0px 14px 28px rgba(0,0,0,0.18)',
        '0px 16px 32px rgba(0,0,0,0.2)',
        '0px 18px 36px rgba(0,0,0,0.22)',
        '0px 20px 40px rgba(0,0,0,0.24)',
        '0px 22px 44px rgba(0,0,0,0.26)',
        '0px 24px 48px rgba(0,0,0,0.28)',
        '0px 26px 52px rgba(0,0,0,0.3)',
        '0px 28px 56px rgba(0,0,0,0.32)',
        '0px 30px 60px rgba(0,0,0,0.34)',
        '0px 32px 64px rgba(0,0,0,0.36)',
        '0px 34px 68px rgba(0,0,0,0.38)',
        '0px 36px 72px rgba(0,0,0,0.4)',
        '0px 38px 76px rgba(0,0,0,0.42)',
        '0px 40px 80px rgba(0,0,0,0.44)',
        '0px 42px 84px rgba(0,0,0,0.46)',
        '0px 44px 88px rgba(0,0,0,0.48)',
        '0px 46px 92px rgba(0,0,0,0.5)',
        '0px 48px 96px rgba(0,0,0,0.52)',
      ],
      zIndex: {
        modal: 10000,
        snackbar: 10100,
        tooltip: 10200,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fafafa',
              scrollbarColor: mode === 'dark' ? '#424242 #1e1e1e' : undefined,
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: mode === 'dark' ? '#1e1e1e' : '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: mode === 'dark' ? '#424242' : '#c1c1c1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: mode === 'dark' ? '#555555' : '#a1a1a1',
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'dark' ? '#323233' : undefined,
              backgroundImage: 'none',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === 'dark' ? '#252526' : '#ffffff',
              backgroundImage: 'none',
              borderRight: mode === 'dark' ? '1px solid #3c3c3c' : '1px solid rgba(0, 0, 0, 0.12)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              padding: '10px 24px',
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
              },
            },
            contained: {
              '&:hover': {
                boxShadow: '0px 6px 16px rgba(0,0,0,0.2)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
                backgroundColor: mode === 'dark' ? '#3c3c3c' : undefined,
                '& fieldset': {
                  borderColor: mode === 'dark' ? '#3c3c3c' : undefined,
                },
                '&:hover fieldset': {
                  borderColor: mode === 'dark' ? '#505050' : undefined,
                },
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              backgroundImage: 'none',
              backgroundColor: mode === 'dark' ? '#252526' : '#ffffff',
              border: mode === 'dark' ? '1px solid #3c3c3c' : undefined,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: mode === 'dark' ? '#252526' : '#ffffff',
            },
            rounded: {
              borderRadius: 12,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 500,
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: mode === 'dark' ? '1px solid #3c3c3c' : '1px solid rgba(224, 224, 224, 1)',
            },
            head: {
              backgroundColor: mode === 'dark' ? '#2d2d2d' : '#fafafa',
              fontWeight: 600,
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#2a2d2e' : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#2a2d2e' : 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: mode === 'dark' ? '#37373d' : 'rgba(25, 118, 210, 0.12)',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? '#404040' : 'rgba(25, 118, 210, 0.18)',
                },
              },
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === 'dark' ? '#252526' : '#ffffff',
              border: mode === 'dark' ? '1px solid #3c3c3c' : undefined,
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#2a2d2e' : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === 'dark' ? '#252526' : '#ffffff',
              backgroundImage: 'none',
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
            standardSuccess: {
              backgroundColor: mode === 'dark' ? '#1e3a29' : undefined,
            },
            standardError: {
              backgroundColor: mode === 'dark' ? '#3a1e1e' : undefined,
            },
            standardWarning: {
              backgroundColor: mode === 'dark' ? '#3a321e' : undefined,
            },
            standardInfo: {
              backgroundColor: mode === 'dark' ? '#1e2a3a' : undefined,
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: mode === 'dark' ? '#3c3c3c' : 'rgba(97, 97, 97, 0.92)',
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: mode === 'dark' ? '#3c3c3c' : 'rgba(0, 0, 0, 0.12)',
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'dark' ? '#3c3c3c' : undefined,
              },
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'dark' ? '#3c3c3c' : undefined,
            },
          },
        },
      },
    });
  }, [config, mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
