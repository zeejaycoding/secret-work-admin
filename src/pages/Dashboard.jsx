  
import { useState, useRef } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Divider,
} from "@mui/material";

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Clock3,
  CircleDollarSign,
  Headphones,
  Bell,
  UserPlus,
  PlayCircle,
  BadgeCheck,
  BookOpen,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { getDashboardStats } from "../services/api";
import usePolling from "../hooks/usePolling";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const COLORS = ["#22C55E", "#00C2A8", "#F5C542", "#6155F5", "#E50914", "#06B6D4"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);

  usePolling(() => {
    if (!hasLoaded.current) setLoading(true);
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => {
        hasLoaded.current = true;
        setLoading(false);
      });
  }, 30000);

  const money = (n) =>
    n == null
      ? "—"
      : n.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  const stats = [
    {
      title: "Total Users",
      value: data?.totalUsers?.toLocaleString() ?? "—",
      icon: Users,
    },
    {
      title: "Active Subscribers",
      value: data?.activeSubscribers?.toLocaleString() ?? "—",
      icon: CreditCard,
    },
    {
      title: "Watch Time",
      value: data?.watchTimeHours != null ? `${data.watchTimeHours} hrs` : "—",
      icon: Clock3,
    },
    {
      title: "Revenue",
      value: money(data?.revenue),
      icon: CircleDollarSign,
    },
    {
      title: "Podcast Plays",
      value: data?.podcastPlays?.toLocaleString() ?? "—",
      icon: Headphones,
    },
  ];

const chartData = MONTHS.map((m, i) => {
  const match = (data?.monthlySignups || []).find((s) => s._id.month === i + 1);
  const rev = (data?.monthlyRevenue || []).find((r) => r._id.month === i + 1);
  return { month: m, users: match?.count || 0, revenue: rev?.total || 0 };
});

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const ACTIVITY_META = {
  drill: { icon: PlayCircle, label: "completed a drill" },
  watch: { icon: Clock3, label: "watched a drill" },
  program: { icon: BookOpen, label: "enrolled in a program" },
  session: { icon: Bell, label: "was active" },
};

const fallbackActivities = [
  { icon: UserPlus, title: "New user joined", time: "5 mins ago" },
  { icon: BadgeCheck, title: "Subscription renewed", time: "18 mins ago" },
  { icon: PlayCircle, title: "Podcast published", time: "42 mins ago" },
  { icon: BookOpen, title: "New drill uploaded", time: "1 hour ago" },
  { icon: Bell, title: "System notification", time: "2 hours ago" },
];

const activities = (data?.recentActivity || []).length
  ? (data?.recentActivity || []).map((a) => {
      const meta = ACTIVITY_META[a.kind] || { icon: Bell, label: "was active" };
      const name =
        [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email || "A user";
      return {
        icon: meta.icon,
        title: `${name} ${meta.label}`,
        time: timeAgo(a.updatedAt),
      };
    })
  : fallbackActivities;

const drillCompletion = (data?.topDrills || []).length
  ? (data?.topDrills || []).map((d, i) => ({
      title: d.title,
      category: d.category || "Drill",
      progress: d.progress,
      completions: d.completions,
      color: COLORS[i % COLORS.length],
    }))
  : [
      { title: "Killer Crossover Combo", category: "Dribbling", progress: 87, color: "#22C55E" },
      { title: "Catch & Shoot Form", category: "Shooting", progress: 74, color: "#00C2A8" },
      { title: "Defensive Slides", category: "Defence", progress: 68, color: "#F5C542" },
      { title: "Euro Step Finish", category: "Defence", progress: 62, color: "#6155F5" },
    ];
  return (
    <Box>
      {/* Breadcrumb */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 4,
        }}
      >
        <LayoutDashboard size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Dashboard
        </Typography>
      </Box>

      {/* Welcome */}
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: { xs: "18px", sm: "20px", md: "24px" },
          color: "#FFFFFF",
          mb: 1,
        }}
      >
        Welcome back Coach
      </Typography>

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: { xs: "12px", md: "13px" },
          color: "#6B6B6B",
          mb: { xs: 3, md: 4 },
        }}
      >
        Here's what's happening on your platform today.
      </Typography>

      {/* Stats Cards */}
      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
    gap: { xs: 1.5, md: 2 },
  }}
>
  {stats.map((item) => {
  const Icon = item.icon;

  return (
    <Box
      key={item.title}
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
      <Box>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "10px",
            color: "#929292",
            mb: 1,
          }}
        >
          {item.title}
        </Typography>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "24px",
            color: "#FFFFFF",
            mb: 1,
          }}
        >
          {item.value}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "10px",
              color: "#FFFFFF",
            }}
          >
            +3%
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "10px",
              color: "#929292",
            }}
          >
            vs last month
          </Typography>
        </Box>
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
    User Growth & Revenue
  </Typography>

  <Box sx={{ width: "100%", height: { xs: 220, sm: 280, md: 350 } }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5ECD0DB2" />
            <stop offset="100%" stopColor="#5ECD0D00" />
          </linearGradient>

          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5D22FFB2" />
            <stop offset="100%" stopColor="#5D22FF00" />
          </linearGradient>
        </defs>

        <CartesianGrid
          stroke="#262626"
          vertical={false}
        />

       <XAxis
  dataKey="month"
  tick={{
    fill: "#929292",
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: 500,
  }}
  axisLine={{ stroke: "#2A2A2A" }}
  tickLine={false}
/>

      <YAxis
  yAxisId="users"
  tick={{
    fill: "#929292",
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: 500,
  }}
  axisLine={{ stroke: "#2A2A2A" }}
  tickLine={false}
  tickFormatter={(v) => v.toLocaleString()}
  width={46}
/>

<YAxis
  yAxisId="revenue"
  orientation="right"
  tick={{
    fill: "#929292",
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: 500,
  }}
  axisLine={false}
  tickLine={false}
  tickFormatter={(v) => `$${v}`}
  width={54}
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
  formatter={(value, name) => {
    if (name === "revenue") return [money(value), "Revenue"];
    return [value, "New Users"];
  }}
/>

        <Area
          yAxisId="users"
          type="monotone"
          dataKey="users"
          stroke="#FFFFFF"
          strokeWidth={3}
          fill="url(#usersFill)"
        />

        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke="#6155F5"
          strokeWidth={3}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </Box>
</Box>

<Box
  sx={{
    mt: 4,
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
    gap: { xs: 2, md: 3 },
  }}
>
  {/* Recent Activity */}

  <Box
    sx={{
      bgcolor: "#161616",
      border: "1px solid #1F1F1F",
      borderRadius: "10px",
      boxShadow: "0px 4px 20px #00000066",
      p: 3,
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "18px",
          color: "#fff",
        }}
      >
        Recent Activity
      </Typography>

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "12px",
          color: "#fff",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        View All
      </Typography>
    </Box>

    {activities.map((item, index) => {
      const Icon = item.icon;

      return (
        <Box key={item.title}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              py: 1.8,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                bgcolor: "#1F1F1F",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mr: 2,
              }}
            >
              <Icon
                size={18}
                color="#FFFFFF"
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#fff",
                }}
              >
                {item.title}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#929292",
                }}
              >
                {item.time}
              </Typography>
            </Box>
          </Box>

          {index !== activities.length - 1 && (
            <Divider
              sx={{
                borderColor: "#1F1F1F",
              }}
            />
          )}
        </Box>
      );
    })}
  </Box>

  {/* Drill Completion */}

  <Box
    sx={{
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
        fontSize: "18px",
        color: "#fff",
        mb: 3,
      }}
    >
      Drill Completion
    </Typography>

    {drillCompletion.map((item) => (
      <Box
        key={item.title}
        sx={{ mb: 3 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: .8,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "13px",
              color: "#fff",
            }}
          >
            {item.title}
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "13px",
              color: "#fff",
            }}
          >
            {item.progress}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={item.progress}
          sx={{
            height: 8,
            borderRadius: 8,
            bgcolor: "#1A1A1A",
            mb: .8,
            "& .MuiLinearProgress-bar": {
              bgcolor: item.color,
              borderRadius: 8,
            },
          }}
        />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "10px",
            color: "#929292",
          }}
        >
          {item.category}
        </Typography>
      </Box>
    ))}
  </Box>
</Box>
    </Box>
  );
}