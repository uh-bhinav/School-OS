import { Paper, Typography, Box, Tooltip, alpha } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import InfoTooltip from "./InfoTooltip";

interface CardProps {
  title: string;
  value: string;
  infoColor: "success" | "warning" | "error" | "info";
  tooltip: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
}

function Card({ title, value, infoColor, tooltip, trend, trendValue }: CardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUpIcon fontSize="small" color="success" />;
      case "down":
        return <TrendingDownIcon fontSize="small" color="error" />;
      case "flat":
        return <TrendingFlatIcon fontSize="small" color="disabled" />;
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <InfoTooltip title={tooltip} />
        </Box>
        {trend && (
          <Tooltip title={trendValue || ""}>
            <Box sx={{ display: "flex", alignItems: "center" }}>{getTrendIcon()}</Box>
          </Tooltip>
        )}
      </Box>
      <Typography variant="h4" color={`${infoColor}.main`} fontWeight={700}>
        {value}
      </Typography>
      {trendValue && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {trendValue}
        </Typography>
      )}
    </Paper>
  );
}

export default function KPICards({
  coveragePct,
  conflictsCount,
  freePeriods,
  roomUtilPct,
}: {
  coveragePct: number;
  conflictsCount: number;
  freePeriods: number;
  roomUtilPct: number;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 2,
      }}
    >
      <Card
        title="Coverage"
        value={`${coveragePct.toFixed(1)}%`}
        infoColor={coveragePct >= 90 ? "success" : coveragePct >= 80 ? "warning" : "error"}
        tooltip="Percentage of total slots that are scheduled. Calculation: (Filled Slots / Total Required Slots) × 100"
        trend={coveragePct >= 90 ? "up" : coveragePct >= 80 ? "flat" : "down"}
        trendValue={coveragePct >= 90 ? "Excellent coverage" : coveragePct >= 80 ? "Good coverage" : "Needs improvement"}
      />
      <Card
        title="Conflicts"
        value={`${conflictsCount}`}
        infoColor={conflictsCount === 0 ? "success" : "error"}
        tooltip="Number of scheduling conflicts (teacher double-bookings or room overlaps)"
        trend={conflictsCount === 0 ? "flat" : "down"}
        trendValue={conflictsCount === 0 ? "No conflicts detected" : `${conflictsCount} conflict${conflictsCount > 1 ? "s" : ""} found`}
      />
      <Card
        title="Free Periods"
        value={`${freePeriods}`}
        infoColor={freePeriods > 0 ? "info" : "success"}
        tooltip="Number of unscheduled slots in the current week"
        trend="flat"
        trendValue={freePeriods > 0 ? `${freePeriods} slot${freePeriods > 1 ? "s" : ""} available` : "Fully scheduled"}
      />
      <Card
        title="Room Utilization"
        value={`${roomUtilPct.toFixed(1)}%`}
        infoColor={roomUtilPct >= 75 ? "success" : "warning"}
        tooltip="Percentage of available rooms being actively used in scheduled periods"
        trend={roomUtilPct >= 75 ? "up" : "flat"}
        trendValue={roomUtilPct >= 75 ? "Optimal usage" : "Can optimize further"}
      />
    </Box>
  );
}
