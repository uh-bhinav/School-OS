// src/app/components/Shell.tsx (enhanced version)
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
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
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Image as ImageIcon,
  Announcement as AnnouncementIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  CalendarToday,
  Assignment,
  BarChart,
} from "@mui/icons-material";
import { useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import { supabase } from "../services/supabase";

export function Protected({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((s) => s.role);
  if (!role) return <Navigate to="/auth/login" replace />;
  if (role !== "admin")
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  return <>{children}</>;
}

const DRAWER_WIDTH = 260;

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  module?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    key: 'academics',
    label: 'Academics',
    icon: <SchoolIcon />,
    path: '/academics',
    children: [
      { key: 'attendance', label: 'Attendance', icon: <CalendarToday fontSize="small" />, path: '/academics/attendance', module: 'academics.attendance' },
      { key: 'timetable', label: 'Timetable', icon: <Assignment fontSize="small" />, path: '/academics/timetable', module: 'academics.timetable' },
      { key: 'exams', label: 'Exams', icon: <BarChart fontSize="small" />, path: '/academics/exams', module: 'academics.exams' },
      { key: 'marks', label: 'Marks', icon: <Assignment fontSize="small" />, path: '/academics/marks', module: 'academics.marks' },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: <MoneyIcon />,
    path: '/finance',
    children: [
      { key: 'fees', label: 'Fees', icon: <MoneyIcon fontSize="small" />, path: '/finance/fees', module: 'finance.fees' },
    ],
  },
  {
    key: 'media',
    label: 'Media',
    icon: <ImageIcon />,
    path: '/media',
    module: 'media.media',
  },
  {
    key: 'comms',
    label: 'Communications',
    icon: <AnnouncementIcon />,
    path: '/comms',
    module: 'comms.announcements',
  },
];

export function Shell() {
  const cfg = useConfigStore((s) => s.config);
  const { clear } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ academics: true });

  const logo = cfg?.branding.logo.primary_url;
  const displayName = cfg?.identity?.display_name ?? "School OS";
  const subscribedModules = cfg?.modules.subscribed ?? [];

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clear();
    navigate("/auth/login", { replace: true });
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isModuleSubscribed = (module?: string) => {
    if (!module) return true;
    return subscribedModules.includes(module);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {logo && (
            <Box
              component="img"
              src={logo}
              alt="school logo"
              sx={{ height: 32, mr: 2 }}
            />
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {displayName}
          </Typography>
          <IconButton color="inherit" onClick={handleProfileMenuOpen}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", pt: 2 }}>
          <List>
            {navigationItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isSubscribed = isModuleSubscribed(item.module);

              if (!isSubscribed) return null;

              return (
                <Box key={item.key}>
                  <ListItemButton
                    onClick={() => {
                      if (hasChildren) {
                        toggleSection(item.key);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    selected={isActive(item.path)}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.primary.dark,
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#fff',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                    {hasChildren && (openSections[item.key] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>

                  {hasChildren && (
                    <Collapse in={openSections[item.key]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children?.map((child) => {
                          if (!isModuleSubscribed(child.module)) return null;

                          return (
                            <ListItemButton
                              key={child.key}
                              onClick={() => navigate(child.path)}
                              selected={isActive(child.path)}
                              sx={{
                                pl: 4,
                                mx: 1,
                                borderRadius: 1,
                                '&.Mui-selected': {
                                  backgroundColor: (theme) => theme.palette.primary.light,
                                  '&:hover': {
                                    backgroundColor: (theme) => theme.palette.primary.main,
                                  },
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText primary={child.label} />
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
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
