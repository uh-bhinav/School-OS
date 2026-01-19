import { useState } from "react";
import {
  Popover,
  Box,
  Typography,
  Fab,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PublishIcon from "@mui/icons-material/Publish";

/**
 * Floating help button with popover explaining timetable features
 */
export default function HowToUsePopover() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Fab
        color="primary"
        aria-label="help"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <HelpOutlineIcon />
      </Fab>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: { maxWidth: 450, p: 2 },
          },
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          📚 How to Use Timetable
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Cell Color Meanings:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Chip label="Free Period" variant="outlined" size="small" />
          <Chip label="Scheduled" color="primary" variant="outlined" size="small" />
          <Chip label="Conflict" color="error" variant="outlined" size="small" />
          <Chip label="Published" color="success" variant="outlined" size="small" />
        </Box>

        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          Actions:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AddCircleOutlineIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Add Period"
              secondary="Click on any empty cell to schedule a new period"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <EditIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Edit Period"
              secondary="Click the edit icon on any filled cell to modify"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SwapHorizIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Swap Periods"
              secondary="Use the Swap button to exchange two periods"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PublishIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
              primary="Publish Week"
              secondary="Make the timetable visible to teachers and students"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          KPI Calculations:
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Coverage %:</strong> Total filled slots / Total required slots
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Conflicts:</strong> Teacher double-bookings or room overlaps
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Free Periods:</strong> Unscheduled slots in the week
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Room Utilization:</strong> % of available rooms actively used
        </Typography>
      </Popover>
    </>
  );
}
