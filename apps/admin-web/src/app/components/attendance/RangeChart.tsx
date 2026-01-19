// components/attendance/RangeChart.tsx
import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Box, Typography, Chip, Paper } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InfoTooltip from "./InfoTooltip";

interface RangeData {
  date: string;
  present_count: number;
  absent_count: number;
  late_count: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <Box sx={{ bgcolor: "background.paper", p: 1.5, borderRadius: 1, boxShadow: 3, border: "1px solid", borderColor: "divider" }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>{label}</Typography>
      {payload.map((entry: any, idx: number) => (
        <Typography key={idx} variant="body2" sx={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </Typography>
      ))}
    </Box>
  );
};

export default function RangeChart({ data }: { data: RangeData[] }) {
  const analysis = useMemo(() => {
    if (!data.length) return null;

    const totalPresent = data.reduce((sum, d) => sum + d.present_count, 0);
    const totalAbsent = data.reduce((sum, d) => sum + d.absent_count, 0);
    const totalLate = data.reduce((sum, d) => sum + d.late_count, 0);
    const total = totalPresent + totalAbsent + totalLate;

    const firstHalf = data.slice(0, Math.ceil(data.length / 2));
    const secondHalf = data.slice(Math.ceil(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.present_count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.present_count, 0) / secondHalf.length;
    const trend = secondAvg - firstAvg;

    return {
      presentPct: ((totalPresent / total) * 100).toFixed(1),
      absentPct: ((totalAbsent / total) * 100).toFixed(1),
      latePct: ((totalLate / total) * 100).toFixed(1),
      trend,
    };
  }, [data]);

  if (!data.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "action.hover" }}>
        <Typography variant="body1" color="text.secondary">
          No attendance data available for the selected date range
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Attendance Trends Over Time
        </Typography>
        <InfoTooltip text="Daily attendance trends showing present, late, and absent counts. Helps identify patterns and anomalies over the selected period." />
      </Box>

      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4caf50" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f44336" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f44336" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9800" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#ff9800" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "currentColor" }}
            axisLine={{ stroke: "currentColor", opacity: 0.3 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            axisLine={{ stroke: "currentColor", opacity: 0.3 }}
            label={{ value: "Count", angle: -90, position: "insideLeft", style: { fill: "currentColor" } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="present_count"
            name="Present"
            stroke="#4caf50"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorPresent)"
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="late_count"
            name="Late"
            stroke="#ff9800"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorLate)"
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="absent_count"
            name="Absent"
            stroke="#f44336"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorAbsent)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>

      {analysis && (
        <Paper sx={{ mt: 3, p: 2.5, bgcolor: "action.hover", borderRadius: 3, borderLeft: "4px solid", borderLeftColor: "primary.main" }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            📈 Period Analysis
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
            <Chip
              label={`${analysis.presentPct}% Present`}
              size="small"
              color="success"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`${analysis.absentPct}% Absent`}
              size="small"
              color="error"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`${analysis.latePct}% Late`}
              size="small"
              color="warning"
              sx={{ fontWeight: 700 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {analysis.trend > 0.5 && (
              <span style={{ color: "#4caf50", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <TrendingUpIcon fontSize="small" />
                Positive trend: Attendance improved by {analysis.trend.toFixed(1)} students on average.
              </span>
            )}
            {analysis.trend < -0.5 && (
              <span style={{ color: "#f44336", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <TrendingDownIcon fontSize="small" />
                Declining trend: Attendance decreased by {Math.abs(analysis.trend).toFixed(1)} students — investigate causes.
              </span>
            )}
            {Math.abs(analysis.trend) <= 0.5 && (
              <span style={{ color: "inherit" }}>
                Stable attendance pattern across the period.
              </span>
            )}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
