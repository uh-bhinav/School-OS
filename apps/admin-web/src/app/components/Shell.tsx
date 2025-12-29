// src/app/components/Shell.tsx (enhanced version)
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
  Collapse,
  CircularProgress,
  TextField,
  InputAdornment,
  Paper,
  ClickAwayListener,
  alpha,
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
  EmojiEvents,
  People,
  Groups,
  Star,
  Receipt,
  Payment,
  LocalOffer,
  Undo,
  PhotoLibrary,
  ShoppingBag,
  PersonOutline,
  EventBusy,
  Business,
  Badge,
  HowToReg,
  WorkHistory,
  AccountBalance,
  Search as SearchIcon,
  MenuBook,
} from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import { supabase } from "../services/supabase";
import { ConfigRoot } from "../providers/ConfigProvider"; // ✅ Import ConfigProvider

// School logo - fallback if not available from config
import schoolLogoFallback from "../public/toch_logo_-removebg-preview.png";

export function Protected({ children }: { children: React.ReactNode }) {
  const { role, schoolId, userId } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Simple check - if no auth data, redirect to login
    // AuthProvider handles all the session restoration logic
    if (!role || !schoolId || !userId) {
      console.log("[PROTECTED] ❌ No auth data - redirecting to login");
      navigate("/auth/login", { replace: true });
    } else {
      console.log("[PROTECTED] ✅ Auth verified:", { role, schoolId });
    }
  }, [role, schoolId, userId, navigate]);

  // If no auth, don't render (will redirect)
  if (!role || !schoolId || !userId) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Check admin privileges
  if (role !== "admin") {
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
  }

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
      { key: 'attendance', label: 'Attendance', icon: <CalendarToday fontSize="small" />, path: '/academics/attendance', module: 'attendance' },
      { key: 'timetable', label: 'Timetable', icon: <Assignment fontSize="small" />, path: '/academics/timetable', module: 'timetable' },
      { key: 'exams', label: 'Exams', icon: <BarChart fontSize="small" />, path: '/academics/exams', module: 'exams' },
      { key: 'marks', label: 'Marks', icon: <Assignment fontSize="small" />, path: '/academics/marks', module: 'marks' },
      { key: 'leaderboards', label: 'Leaderboards', icon: <EmojiEvents fontSize="small" />, path: '/academics/leaderboards' },
      { key: 'teachers', label: 'Teachers', icon: <People fontSize="small" />, path: '/academics/teachers' },
      { key: 'classes', label: 'Classes', icon: <SchoolIcon fontSize="small" />, path: '/academics/classes' },
      { key: 'subjects', label: 'Subjects', icon: <MenuBook fontSize="small" />, path: '/academics/subjects' },
      { key: 'co-attainment', label: 'CO Attainment', icon: <BarChart fontSize="small" />, path: '/academics/co-attainment' },
      { key: 'students', label: 'Students', icon: <PersonOutline fontSize="small" />, path: '/academics/students' },
      { key: 'clubs', label: 'Clubs & Activities', icon: <Groups fontSize="small" />, path: '/academics/clubs' },
      { key: 'achievements', label: 'Achievements', icon: <Star fontSize="small" />, path: '/academics/achievements' },
      { key: 'leave-management', label: 'Leave Management', icon: <EventBusy fontSize="small" />, path: '/academics/leave-management' },
      { key: 'tasks', label: 'Task Manager', icon: <Assignment fontSize="small" />, path: '/academics/tasks' },
    ],
  },
  {
    key: 'hr',
    label: 'HR Module',
    icon: <Badge />,
    path: '/hr',
    children: [
      { key: 'hr-dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/hr' },
      { key: 'staff', label: 'Staff Management', icon: <People fontSize="small" />, path: '/hr/staff' },
      { key: 'departments', label: 'Departments', icon: <Business fontSize="small" />, path: '/hr/departments' },
      { key: 'staff-wall', label: 'Staff Wall', icon: <WorkHistory fontSize="small" />, path: '/hr/staff-wall' },
      { key: 'staff-attendance', label: 'Staff Attendance', icon: <HowToReg fontSize="small" />, path: '/hr/attendance' },
    ],
  },
  {
    key: 'announcements',
    label: 'Announcements',
    icon: <AnnouncementIcon />,
    path: '/announcements',
    module: 'announcements',
  },
  {
    key: 'communications',
    label: 'Messages',
    icon: <AnnouncementIcon />,
    path: '/communications',
    module: 'communications',
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: <MoneyIcon />,
    path: '/finance',
    children: [
      { key: 'fees', label: 'Fees', icon: <MoneyIcon fontSize="small" />, path: '/finance/fees', module: 'fee-management' },
      { key: 'invoices', label: 'Invoices', icon: <Receipt fontSize="small" />, path: '/finance/invoices' },
      { key: 'payments', label: 'Payments', icon: <Payment fontSize="small" />, path: '/finance/payments' },
      { key: 'discounts', label: 'Discounts', icon: <LocalOffer fontSize="small" />, path: '/finance/discounts' },
      { key: 'refunds', label: 'Refunds', icon: <Undo fontSize="small" />, path: '/finance/refunds' },
      { key: 'budgets', label: 'Budgets', icon: <AccountBalance fontSize="small" />, path: '/finance/budgets' },
    ],
  },
  {
    key: 'events',
    label: 'Events',
    icon: <CalendarToday />,
    path: '/events',
    module: 'events',
  },
  {
    key: 'media',
    label: 'Media & Store',
    icon: <ImageIcon />,
    path: '/media',
    children: [
      { key: 'albums', label: 'Albums', icon: <PhotoLibrary fontSize="small" />, path: '/media/albums' },
      { key: 'products', label: 'Products', icon: <ShoppingBag fontSize="small" />, path: '/media/products' },
    ],
  },
];

export function Shell() {
  const cfg = useConfigStore((s) => s.config);
  const { clear } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ academics: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Use config logo only if it's a valid non-null URL, otherwise use fallback
  const configLogo = cfg?.branding?.logo?.primary_url;
  const logo = (configLogo && typeof configLogo === 'string' && configLogo.startsWith('http'))
    ? configLogo
    : schoolLogoFallback;
  const displayName = cfg?.identity?.display_name ?? "School OS";
  const subscribedModules = cfg?.modules.subscribed ?? [];

  // Flatten all navigation items for search
  const allSearchableItems = useMemo(() => {
    const items: Array<{ label: string; path: string; icon: React.ReactNode; parent?: string }> = [];
    navigationItems.forEach((item) => {
      items.push({ label: item.label, path: item.path, icon: item.icon });
      if (item.children) {
        item.children.forEach((child) => {
          items.push({ label: child.label, path: child.path, icon: child.icon, parent: item.label });
        });
      }
    });
    return items;
  }, []);

  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        (item.parent && item.parent.toLowerCase().includes(query))
    );
  }, [searchQuery, allSearchableItems]);

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setSearchOpen(false);
  };

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
    // Events module should always be visible even if not in subscribed list
    if (module === 'events') return true;
    // If config is not yet loaded, show ALL modules by default (optimistic UI)
    if (!cfg || !cfg.modules?.subscribed) {
      console.log('[SHELL] Config not loaded yet - showing module:', module);
      return true;
    }
    console.log('[SHELL] Checking module:', module, 'in', subscribedModules);
    return subscribedModules.includes(module);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // ✅ Wrap Shell content in ConfigRoot to load configuration after auth
  return (
    <ConfigRoot>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Box
            component="img"
            src={logo}
            alt="school logo"
            sx={{
              height: 40,
              width: 40,
              mr: 2,
              objectFit: "contain",
              borderRadius: 1,
            }}
            onError={(e) => {
              // If image fails to load, use fallback
              (e.target as HTMLImageElement).src = schoolLogoFallback;
            }}
          />
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

        {/* Search Bar */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
            <Box sx={{ position: "relative" }}>
              <TextField
                size="small"
                placeholder="Search modules…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.5),
                    "&:hover": {
                      backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.8),
                    },
                    "&.Mui-focused": {
                      backgroundColor: "background.paper",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    py: 1,
                    fontSize: "0.875rem",
                  },
                }}
              />

              {/* Search Results Dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <Paper
                  elevation={8}
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    mt: 0.5,
                    zIndex: 1300,
                    maxHeight: 280,
                    overflow: "auto",
                    borderRadius: 2,
                  }}
                >
                  <List dense disablePadding>
                    {searchResults.slice(0, 8).map((result, idx) => (
                      <ListItemButton
                        key={`${result.path}-${idx}`}
                        onClick={() => handleSearchSelect(result.path)}
                        sx={{
                          py: 1,
                          "&:hover": {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {result.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.label}
                          secondary={result.parent}
                          primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: "0.75rem" }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </ClickAwayListener>
        </Box>

        <Divider sx={{ mx: 2, mb: 1 }} />

        <Box sx={{ overflow: "auto", pt: 1 }}>
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
          pb: 12, // Extra padding at bottom for chat input overlay
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
    </ConfigRoot>
  );
}
