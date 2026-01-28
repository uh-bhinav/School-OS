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
} from "@mui/material";
import {
  Dashboard,
  People,
  Assignment,
  LocalShipping,
  Event,
  Campaign,
  Build,
  AccountCircle,
  Settings,
  Logout,
} from "@mui/icons-material";
import { useState } from "react";
import { supabase } from "../services/supabase";
import { useAuthStore } from "../stores/useAuthStore";

const DRAWER_WIDTH = 240;

const frontOfficeNav = [
  { label: "Dashboard", icon: <Dashboard />, path: "/frontoffice" },
  { label: "Visitors", icon: <People />, path: "/frontoffice/visitors" },
  { label: "Couriers", icon: <LocalShipping />, path: "/frontoffice/couriers" },
  { label: "Admissions", icon: <Assignment />, path: "/frontoffice/admissions" },
  { label: "Admissions Pipeline", icon: <Assignment />, path: "/frontoffice/admissions-pipeline" },
  { label: "Service Requests", icon: <Build />, path: "/frontoffice/serviceRequest" },
  { label: "Principal Calendar", icon: <Event />, path: "/frontoffice/principalCalendar" },
  { label: "Communication", icon: <Campaign />, path: "/frontoffice/communication" },
  { label: "Gate Pass Management", icon: <Assignment />, path: "/frontoffice/gate-pass-management" },
];

export function FrontOfficeShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear } = useAuthStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clear();
    navigate("/auth/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ================= TOP BAR ================= */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Front Office
          </Typography>

          <IconButton color="inherit" onClick={handleProfileOpen}>
            <AccountCircle />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
          >
            <MenuItem onClick={() => navigate("/settings")}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ================= SIDE NAV ================= */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          {frontOfficeNav.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                "&.Mui-selected": {
                  backgroundColor: (theme) => theme.palette.primary.main,
                  color: "#fff",
                  "& .MuiListItemIcon-root": {
                    color: "#fff",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* ================= MAIN CONTENT ================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
