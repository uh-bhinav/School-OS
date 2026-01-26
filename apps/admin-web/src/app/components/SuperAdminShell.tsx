// ============================================================================
// SUPER ADMIN SHELL - Fully Isolated Layout for Group-Level Management
// ============================================================================
// Separate shell for super admin users managing multiple schools.
// Does NOT share any routes or state with the principal shell.
// Navigation: Group Overview, Schools, Academics, Financial Health,
//             Compliance & Risk, Communication
// ============================================================================

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  alpha,
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Security as ComplianceIcon,
  Message as CommunicationIcon,
  Assessment as AcademicsIcon,
  Business as GroupIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeMode } from "../providers/ThemeProvider";
import { supabase } from "../services/supabase";

// Group logo - fallback for super admin
import groupLogoFallback from "../public/toch_logo_-removebg-preview.png";

const DRAWER_WIDTH = 260;
const APP_VERSION = "v1.0.0-beta";

interface NavSubItem {
  key: string;
  label: string;
  path: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  subItems?: NavSubItem[];
}

// Super Admin navigation items - with optional nested items
const superAdminNavItems: NavItem[] = [
  {
    key: "group-overview",
    label: "Group Overview",
    icon: <DashboardIcon />,
    path: "/group-overview",
  },
  {
    key: "schools",
    label: "Schools",
    icon: <SchoolIcon />,
    path: "/group-overview/schools",
  },
  {
    key: "academics",
    label: "Academics",
    icon: <AcademicsIcon />,
    path: "/group-overview/academics",
    subItems: [
      {
        key: "attendance-health",
        label: "Attendance Health",
        path: "/group-overview/academics/attendance",
      },
      {
        key: "curriculum-pacing",
        label: "Curriculum Pacing",
        path: "/group-overview/academics/curriculum-pacing",
      },
    ],
  },
  {
    key: "financial-health",
    label: "Financial Health",
    icon: <MoneyIcon />,
    path: "/group-overview/financial",
    subItems: [
      {
        key: "fee-collection",
        label: "Fee Collection",
        path: "/group-overview/financial/fee-collection",
      },
      {
        key: "dues-aging",
        label: "Dues & Aging",
        path: "/group-overview/financial/dues-aging",
      },
      {
        key: "capacity-forecast",
        label: "Capacity Forecast",
        path: "/group-overview/financial/capacity-forecast",
      },
    ],
  },
  {
    key: "compliance-risk",
    label: "Compliance & Risk",
    icon: <ComplianceIcon />,
    path: "/group-overview/compliance",
    subItems: [
      {
        key: "compliance-overview",
        label: "Overview",
        path: "/group-overview/compliance",
      },
      {
        key: "certificates",
        label: "Certificates & Renewals",
        path: "/group-overview/compliance/certificates",
      },
      {
        key: "regulatory-alerts",
        label: "Regulatory Alerts",
        path: "/group-overview/compliance/alerts",
      },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    icon: <CommunicationIcon />,
    path: "/group-overview/communication",
    subItems: [
      {
        key: "parent-engagement",
        label: "Parent Engagement",
        path: "/group-overview/communication/parent-engagement",
      },
      {
        key: "effectiveness",
        label: "Effectiveness Summary",
        path: "/group-overview/communication/effectiveness",
      },
    ],
  },
];

export function SuperAdminShell() {
  const { cachedProfile, clear } = useAuthStore();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // User info
  const firstName = cachedProfile?.first_name ?? "Super";
  const lastName = cachedProfile?.last_name ?? "Admin";
  const fullName = `${firstName} ${lastName}`.trim();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    console.log("[SUPERADMIN SHELL] 🚪 Logging out...");
    await supabase.auth.signOut();
    clear();
    navigate("/auth/login", { replace: true });
  };

  const isActive = (path: string) => {
    // Exact match for group-overview, prefix match for others
    if (path === "/group-overview") {
      return location.pathname === "/group-overview";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: (theme) =>
            mode === "dark" ? "#1a1a2e" : theme.palette.primary.main,
        }}
      >
        <Toolbar>
          {/* Group Logo */}
          <Box
            component="img"
            src={groupLogoFallback}
            alt="group logo"
            sx={{
              height: 40,
              width: 40,
              mr: 2,
              objectFit: "contain",
              borderRadius: 1,
            }}
          />

          {/* Group Name - Centered, disabled dropdown (per spec) */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: (theme) => alpha(theme.palette.common.white, 0.1),
              }}
            >
              <GroupIcon fontSize="small" />
              <Typography variant="subtitle1" fontWeight={600}>
                Tapasya Vidyanikethan Group
              </Typography>
            </Box>
          </Box>

          {/* Right side: Theme toggle, Version badge, Profile menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Dark/Light Mode Toggle */}
            <Tooltip title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton color="inherit" onClick={toggleMode} size="small">
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Version Badge */}
            <Chip
              label={APP_VERSION}
              size="small"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.common.white, 0.15),
                color: "inherit",
                fontSize: "0.7rem",
                height: 24,
              }}
            />

            {/* Profile Menu */}
            <Tooltip title={fullName}>
              <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: { minWidth: 200 },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Super Administrator
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => navigate("/group-overview/settings")}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar - Always expanded for desktop-first design */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: (theme) =>
              `1px solid ${mode === "dark" ? "#2d2d2d" : theme.palette.divider}`,
            backgroundColor: (theme) =>
              mode === "dark" ? "#1e1e1e" : theme.palette.background.paper,
          },
        }}
      >
        <Toolbar />

        {/* Navigation List */}
        <Box sx={{ overflow: "auto", flex: 1, py: 2 }}>
          <List>
            {superAdminNavItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isParentActive = isActive(item.path);
              const isExpanded = hasSubItems && location.pathname.startsWith(item.path);

              return (
                <Box key={item.key}>
                  <ListItemButton
                    onClick={() => {
                      if (hasSubItems) {
                        // Navigate to first sub-item when clicking parent
                        navigate(item.subItems![0].path);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    selected={isParentActive && !hasSubItems}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      mb: 0.5,
                      "&.Mui-selected": {
                        backgroundColor: (theme) =>
                          mode === "dark"
                            ? alpha(theme.palette.primary.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.1),
                        "&:hover": {
                          backgroundColor: (theme) =>
                            mode === "dark"
                              ? alpha(theme.palette.primary.main, 0.3)
                              : alpha(theme.palette.primary.main, 0.15),
                        },
                      },
                      "&:hover": {
                        backgroundColor: (theme) =>
                          mode === "dark"
                            ? alpha(theme.palette.action.hover, 0.8)
                            : theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isParentActive ? "primary.main" : "text.secondary",
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isParentActive ? 600 : 400,
                        fontSize: "0.875rem",
                        color: isParentActive ? "primary.main" : "text.primary",
                      }}
                    />
                    {hasSubItems && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>

                  {/* Sub-items */}
                  {hasSubItems && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.subItems!.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <ListItemButton
                              key={subItem.key}
                              onClick={() => navigate(subItem.path)}
                              selected={isSubActive}
                              sx={{
                                pl: 6,
                                mx: 1,
                                borderRadius: 1,
                                mb: 0.25,
                                minHeight: 36,
                                "&.Mui-selected": {
                                  backgroundColor: (theme) =>
                                    mode === "dark"
                                      ? alpha(theme.palette.primary.main, 0.15)
                                      : alpha(theme.palette.primary.main, 0.08),
                                  "&:hover": {
                                    backgroundColor: (theme) =>
                                      mode === "dark"
                                        ? alpha(theme.palette.primary.main, 0.25)
                                        : alpha(theme.palette.primary.main, 0.12),
                                  },
                                },
                                "&:hover": {
                                  backgroundColor: (theme) =>
                                    mode === "dark"
                                      ? alpha(theme.palette.action.hover, 0.6)
                                      : theme.palette.action.hover,
                                },
                              }}
                            >
                              <ListItemText
                                primary={subItem.label}
                                primaryTypographyProps={{
                                  fontWeight: isSubActive ? 600 : 400,
                                  fontSize: "0.8rem",
                                  color: isSubActive ? "primary.main" : "text.secondary",
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </List>
        </Box>

        {/* Footer - Version info */}
        <Box
          sx={{
            p: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Acadion AI - Super Admin
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {APP_VERSION}
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: (theme) =>
            mode === "dark" ? "#121212" : theme.palette.grey[50],
          minHeight: "100vh",
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default SuperAdminShell;
