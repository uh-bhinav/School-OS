import { Box, Card, CardContent, Typography, Tooltip, IconButton } from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

/**
 * QuestionDifficultyChart
 *
 * Shows average % scored per question — derived from question-level marks.
 * Questions below 50% average are flagged as "difficult".
 *
 * In production, this data comes from aggregating question-wise marks entries.
 * For demo, we use realistic mock data that looks like it was derived from
 * the question blueprints defined in QuestionWiseMarkDialog.
 */

// Mock derived data: average score per question for the selected exam
// Simulates aggregation from all students' question-wise entries
const MOCK_QUESTION_DIFFICULTY = [
  { question: "Q1", avg_pct: 82, max: 10, co: "CO1", bloom: "Remember" },
  { question: "Q2", avg_pct: 71, max: 15, co: "CO1", bloom: "Understand" },
  { question: "Q3", avg_pct: 58, max: 10, co: "CO2", bloom: "Apply" },
  { question: "Q4", avg_pct: 43, max: 20, co: "CO2", bloom: "Analyze" },
  { question: "Q5", avg_pct: 52, max: 15, co: "CO3", bloom: "Apply" },
  { question: "Q6", avg_pct: 39, max: 10, co: "CO3", bloom: "Evaluate" },
  { question: "Q7", avg_pct: 34, max: 20, co: "CO4", bloom: "Create" },
];

const getBarColor = (pct: number) => {
  if (pct >= 70) return "#66bb6a";
  if (pct >= 50) return "#ff9800";
  return "#ef5350";
};

export function QuestionDifficultyChart() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
          <Typography variant="h6">Question Difficulty</Typography>
          <Tooltip title="Average % scored per question across all students. Questions below the 50% line (red/orange bars) indicate high difficulty — often mapped to higher-order Bloom levels.">
            <IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Avg % scored per question (class-wide) — Mid-Term, Mathematics
        </Typography>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={MOCK_QUESTION_DIFFICULTY} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis domain={[0, 100]} label={{ value: "Avg %", angle: -90, position: "insideLeft" }} />
            <RechartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <Box sx={{ bgcolor: "background.paper", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                      <Typography variant="subtitle2">{d.question} (Max: {d.max})</Typography>
                      <Typography variant="body2">Avg: {d.avg_pct}%</Typography>
                      <Typography variant="body2" color="text.secondary">CO: {d.co} | Bloom: {d.bloom}</Typography>
                      <Typography variant="body2" color={d.avg_pct < 50 ? "error.main" : "success.main"} fontWeight={600}>
                        {d.avg_pct < 50 ? "⚠ Difficult" : "✓ On track"}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={50} stroke="#d32f2f" strokeDasharray="5 5" label={{ value: "50% target", position: "right", fill: "#d32f2f", fontSize: 11 }} />
            <Bar dataKey="avg_pct" name="Avg %" radius={[4, 4, 0, 0]}>
              {MOCK_QUESTION_DIFFICULTY.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.avg_pct)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
