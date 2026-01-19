// components/attendance/SummaryCards.tsx
import { Box, Paper, Typography, Stack, LinearProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InfoTooltip from "./InfoTooltip";
import { useState, useEffect } from "react";

function AnimatedCounter({ target, duration = 800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count.toFixed(1)}</>;
}

function getColorForPercentage(pct: number): string {
  if (pct >= 90) return "#4caf50"; // Green (≥90%)
  if (pct >= 80) return "#ff9800"; // Yellow/Orange (80-90%)
  return "#f44336"; // Red (<80%)
}

function getStatusText(pct: number): string {
  if (pct >= 90) return "Excellent";
  if (pct >= 80) return "Good";
  return "Needs Attention";
}

export default function SummaryCards(props: {
  presentPct: number;
  latePct: number;
  unmarked: number;
}) {
  const { presentPct, latePct, unmarked } = props;

  const cards = [
    {
      title: "Present",
      value: presentPct,
      suffix: "%",
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      info: "Percentage of students marked PRESENT for the selected date. Target threshold: ≥90% (Excellent), 80-90% (Good), <80% (Needs Attention).",
      color: getColorForPercentage(presentPct),
      status: getStatusText(presentPct),
      trendIcon: presentPct >= 90 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />,
    },
    {
      title: "Late",
      value: latePct,
      suffix: "%",
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      info: "Percentage of students marked LATE. Monitor patterns if consistently above 15%. Indicates potential punctuality issues.",
      color: latePct > 15 ? "#f44336" : latePct > 10 ? "#ff9800" : "#4caf50",
      status: latePct > 15 ? "High" : latePct > 10 ? "Moderate" : "Low",
      trendIcon: latePct > 15 ? <TrendingUpIcon fontSize="small" /> : null,
    },
    {
      title: "Unmarked",
      value: unmarked,
      suffix: "",
      icon: <HelpOutlineIcon sx={{ fontSize: 40 }} />,
      info: "Number of students with no attendance record yet for this date. Complete marking to ensure accurate reporting and compliance.",
      color: unmarked > 5 ? "#f44336" : unmarked > 0 ? "#ff9800" : "#4caf50",
      status: unmarked > 5 ? "Action Required" : unmarked > 0 ? "Pending" : "Complete",
      trendIcon: null,
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
      {cards.map((card, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${card.color}08 0%, ${card.color}18 100%)`,
            border: `1px solid ${card.color}30`,
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: `0 12px 24px ${card.color}20`,
              borderColor: `${card.color}60`,
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: "120px",
              height: "120px",
              background: `radial-gradient(circle, ${card.color}15 0%, transparent 70%)`,
              transform: "translate(30%, -30%)",
            },
          }}
        >
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.75rem" }}
                >
                  {card.title}
                </Typography>
                <InfoTooltip text={card.info} />
              </Stack>
              <Box sx={{ color: card.color, opacity: 0.9 }}>
                {card.icon}
              </Box>
            </Stack>

            {/* Value */}
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  color: card.color,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  lineHeight: 1,
                }}
              >
                <AnimatedCounter target={card.value} />
              </Typography>
              <Typography variant="h5" fontWeight={600} sx={{ color: card.color, opacity: 0.8 }}>
                {card.suffix}
              </Typography>
              {card.trendIcon && (
                <Box sx={{ color: card.color, ml: 1 }}>
                  {card.trendIcon}
                </Box>
              )}
            </Stack>

            {/* Status Badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor: `${card.color}20`,
                border: `1px solid ${card.color}40`,
                width: "fit-content",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: card.color, textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                {card.status}
              </Typography>
            </Box>

            {/* Progress Bar (for percentage cards) */}
            {card.suffix === "%" && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(card.value, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: `${card.color}15`,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      bgcolor: card.color,
                      transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    },
                  }}
                />
              </Box>
            )}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
