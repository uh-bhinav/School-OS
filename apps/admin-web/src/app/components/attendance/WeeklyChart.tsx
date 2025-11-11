// components/attendance/WeeklyChart.tsx
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend, LabelList, CartesianGrid } from "recharts";
import { Box, Typography, Chip, Paper } from "@mui/material";
import InfoTooltip from "./InfoTooltip";

interface WeeklyData {
  grade_label: string;
  present_pct: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;
  const data = payload[0].payload;
  return (
    <Box sx={{ bgcolor: "background.paper", p: 1.5, borderRadius: 1, boxShadow: 3, border: "1px solid", borderColor: "divider" }}>
      <Typography variant="subtitle2" fontWeight={600}>{data.grade_label}</Typography>
      <Typography variant="body2" color="text.secondary">
        Attendance: <strong>{data.present_pct.toFixed(1)}%</strong>
      </Typography>
    </Box>
  );
};

export default function WeeklyChart({ data }: { data: WeeklyData[] }) {
  const summary = useMemo(() => {
    if (!data.length) return null;
    const avg = data.reduce((sum, d) => sum + d.present_pct, 0) / data.length;
    const best = [...data].sort((a, b) => b.present_pct - a.present_pct)[0];
    const worst = [...data].sort((a, b) => a.present_pct - b.present_pct)[0];

    return { avg, best, worst };
  }, [data]);

  if (!data.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "action.hover" }}>
        <Typography variant="body1" color="text.secondary">
          No weekly attendance data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Weekly Attendance by Grade
        </Typography>
        <InfoTooltip text="Weekly attendance percentage across all grades. Target is 90% or higher. Click on bars to view grade details." />
      </Box>

      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4caf50" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4caf50" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff9800" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ff9800" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f44336" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#f44336" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey="grade_label"
            tick={{ fontSize: 12, fill: "currentColor" }}
            axisLine={{ stroke: "currentColor", opacity: 0.3 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "currentColor" }}
            label={{ value: "Attendance %", angle: -90, position: "insideLeft", style: { fill: "currentColor" } }}
            axisLine={{ stroke: "currentColor", opacity: 0.3 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(11, 95, 90, 0.1)", radius: 8 }} />
          <Legend />
          <ReferenceLine
            y={90}
            stroke="#4caf50"
            strokeDasharray="4 4"
            label={{ value: "Target: 90%", fontSize: 11, fill: "#4caf50", fontWeight: 600 }}
          />
          <Bar
            dataKey="present_pct"
            name="Present %"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          >
            {data.map((entry, index) => {
              const color = entry.present_pct >= 90 ? "url(#colorGreen)" : entry.present_pct >= 80 ? "url(#colorOrange)" : "url(#colorRed)";
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
            <LabelList dataKey="present_pct" position="top" content={(props: any) => {
              const { x, y, value } = props;
              return (
                <text x={x} y={y} dy={-8} fill="currentColor" fontSize={11} fontWeight={600} textAnchor="middle">
                  {typeof value === 'number' ? `${value.toFixed(1)}%` : ''}
                </text>
              );
            }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {summary && (
        <Paper sx={{ mt: 3, p: 2.5, bgcolor: "action.hover", borderRadius: 3, borderLeft: "4px solid", borderLeftColor: "primary.main" }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            📊 Weekly Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average attendance is{" "}
            <Chip
              label={`${summary.avg.toFixed(1)}%`}
              size="small"
              color={summary.avg >= 90 ? "success" : summary.avg >= 80 ? "warning" : "error"}
              sx={{ mx: 0.5, fontWeight: 700 }}
            />
            {summary.avg >= 90
              ? " — Excellent performance across all grades!"
              : summary.avg >= 80
              ? " — Good overall, but there's room for improvement."
              : " — Needs attention to improve attendance rates."}
            {" "}Best performer: <strong>{summary.best.grade_label}</strong> ({summary.best.present_pct.toFixed(1)}%).
            {summary.worst.present_pct < 85 && (
              <span style={{ color: "#f44336", fontWeight: 600 }}>
                {" "}{summary.worst.grade_label} needs attention at {summary.worst.present_pct.toFixed(1)}%.
              </span>
            )}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
