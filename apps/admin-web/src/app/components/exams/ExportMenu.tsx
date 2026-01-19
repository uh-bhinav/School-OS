import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
} from "@mui/icons-material";

interface ExportMenuProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  disabled?: boolean;
}

export default function ExportMenu({
  onExportCSV,
  onExportPDF,
  disabled = false,
}: ExportMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportCSV = () => {
    onExportCSV();
    handleClose();
  };

  const handleExportPDF = () => {
    onExportPDF();
    handleClose();
  };

  return (
    <>
      <Tooltip title="Export Data">
        <IconButton
          onClick={handleClick}
          disabled={disabled}
          sx={{
            bgcolor: "#0B5F5A",
            color: "white",
            "&:hover": { bgcolor: "#094a46" },
          }}
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
