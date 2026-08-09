import { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import {
  Activity,
  Zap,
  Repeat,
  Trophy,
  Download,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import { getAnalytics } from "../services/api";
import usePolling from "../hooks/usePolling";

const csvCell = (value) => {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const exportAnalyticsCsv = (drills, daily) => {
  const header = ["Daily Active Users", "Users", "Most Watched Drills", "Views"];
  const rows = [];
  const maxLen = Math.max(drills.length, daily.length);
  for (let i = 0; i < maxLen; i++) {
    rows.push([
      daily[i]?.label || "",
      daily[i]?.users ?? "",
      drills[i]?.name || "",
      drills[i]?.views ?? "",
    ]);
  }
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  usePolling(() => {
    if (!hasLoaded.current) setLoading(true);
    getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => {
        hasLoaded.current = true;
        setLoading(false);
      });
  }, 30000);

  const stats = data?.stats
    ? [
        {
          title: "DAU",
          value: data.stats.dau.toLocaleString(),
          icon: Activity,
        },
        {
          title: "Active Sessions",
          value: data.stats.activeSessions.toLocaleString(),
          icon: Zap,
        },
        {
          title: "Retention",
          value: `${data.stats.retention}%`,
          icon: Repeat,
        },
        {
          title: "Top Coach",
          value: data.stats.topCoach?.name || "—",
          icon: Trophy,
          small: true,
        },
      ]
    : [];

  const dailyActive = data?.dailyActive || [];
  const mostWatchedDrills = data?.mostWatchedDrills || [];
  const maxViews = mostWatchedDrills.reduce(
    (max, d) => Math.max(max, d.views || 0),
    0
  );

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <Activity size={20} color="#929292" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Analytics
        </Typography>
      </Box>

      {/* Heading + Export */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: { xs: 3, md: 4 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "18px", sm: "20px", md: "24px" },
              color: "#FFFFFF",
              mb: 0.5,
            }}
          >
            Analytics
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "12px", md: "13px" },
              color: "#6B6B6B",
            }}
          >
            Deep insights across users, content, podcasts and engagement.
          </Typography>
        </Box>

        <Button
          startIcon={<Download size={16} color="#FFFFFF" />}
          onClick={() => exportAnalyticsCsv(mostWatchedDrills, dailyActive)}
          sx={{
            bgcolor: "#1F1F1F",
            border: "1px solid #2A2A2A",
            borderRadius: "10px",
            color: "#D6D6D6",
            textTransform: "none",
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "12px",
            px: 2.5,
            py: 1,
            flexShrink: 0,

            "&:hover": {
              bgcolor: "#1F1F1F",
              borderColor: "#3A3A3A",
            },
          }}
        >
          Export
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {(loading ? [0, 1, 2, 3] : stats).map((item, i) => {
          const Icon = loading ? Activity : item.icon;

          return (
            <Box
              key={i}
              sx={{
                bgcolor: "#161616",
                borderRadius: "10px",
                boxShadow: "0px 4px 20px #00000066",
                p: 2.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ minWidth: 0, pr: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "#929292",
                    mb: 1,
                  }}
                >
                  {loading ? "—" : item.title}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: item.small ? "16px" : "24px",
                    color: "#FFFFFF",
                    mb: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading ? "—" : item.value}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={28} color="#484848" />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Daily Active Users - line graph */}
      <Box
        sx={{
          mt: 4,
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "10px",
          boxShadow: "0px 4px 20px #00000066",
          p: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "16px",
            color: "#FFFFFF",
            mb: 3,
          }}
        >
          Daily Active Users
        </Typography>

        <Box sx={{ width: "100%", height: { xs: 240, md: 320 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyActive}>
              <defs>
                <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E50914" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#E50914" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#2A2A2A" strokeDasharray="0" />
              <XAxis
                dataKey="label"
                tick={{
                  fill: "#929292",
                  fontSize: 11,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                }}
                axisLine={{ stroke: "#2A2A2A" }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{
                  fill: "#929292",
                  fontSize: 11,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "#2A2A2A" }}
                contentStyle={{
                  bgcolor: "#1F1F1F",
                  border: "1px solid #2A2A2A",
                  borderRadius: "10px",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#FFFFFF" }}
                itemStyle={{ color: "#FFFFFF" }}
                formatter={(v) => [`${v} users`, "Active"]}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#E50914"
                strokeWidth={3}
                fill="url(#dauGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Most Watched Drills - bar chart */}
      <Box
        sx={{
          mt: 4,
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "10px",
          boxShadow: "0px 4px 20px #00000066",
          p: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "16px",
            color: "#FFFFFF",
            mb: 3,
          }}
        >
          Most Watched Drills
        </Typography>

        {loading ? (
          <Box
            sx={{
              py: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "#E50914" }} />
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                color: "#929292",
              }}
            >
              Loading analytics...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%", height: { xs: 280, md: 360 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostWatchedDrills}>
                <CartesianGrid stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "#929292",
                    fontSize: 10,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "#2A2A2A" }}
                  tickLine={false}
                  interval={0}
                  height={60}
                />
                <YAxis
                  tick={{
                    fill: "#929292",
                    fontSize: 11,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "#2A2A2A" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#1A1A1A" }}
                  contentStyle={{
                    bgcolor: "#1F1F1F",
                    border: "1px solid #2A2A2A",
                    borderRadius: "10px",
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#FFFFFF" }}
                  itemStyle={{ color: "#FFFFFF" }}
                  formatter={(v) => [`${v} views`, "Views"]}
                />
                <Bar dataKey="views" radius={[6, 6, 0, 0]} barSize={42}>
                  {mostWatchedDrills.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        maxViews > 0 && d.views === maxViews
                          ? "#E50914"
                          : "#2A2A2A"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
}
