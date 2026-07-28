  
import { useState, useEffect } from "react";
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
} from "recharts";

import { getDashboardStats } from "../services/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const COLORS = ["#22C55E", "#00C2A8", "#F5C542", "#6155F5", "#E50914", "#06B6D4"];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
      value: data?.totalViews ? data.totalViews.toLocaleString() : "—",
      icon: Clock3,
    },
    {
      title: "Revenue",
      value: data?.totalDrills?.toLocaleString() ?? "—",
      icon: CircleDollarSign,
    },
    {
      title: "Podcast Plays",
      value: data?.freeUsers?.toLocaleString() ?? "—",
      icon: Headphones,
    },
  ];

const chartData = MONTHS.map((m, i) => {
  const match = (data?.monthlySignups || []).find((s) => s._id.month === i + 1);
  return { month: m, users: match?.count || 0, revenue: Math.round((match?.count || 0) * 0.7) };
});

const activities = (data?.recentUsers || []).length > 0
  ? data.recentUsers.map((u) => ({
      icon: UserPlus,
      title: `${u.firstName || u.name || "New user"} joined`,
      time: u.email,
    }))
  : [
      { icon: UserPlus, title: "New user joined", time: "5 mins ago" },
      { icon: BadgeCheck, title: "Subscription renewed", time: "18 mins ago" },
      { icon: PlayCircle, title: "Podcast published", time: "42 mins ago" },
      { icon: BookOpen, title: "New drill uploaded", time: "1 hour ago" },
      { icon: Bell, title: "System notification", time: "2 hours ago" },
    ];

const drillCompletion = (data?.recentUsers || []).length > 0
  ? data.recentUsers.slice(0, 4).map((u, i) => ({
      title: `${u.firstName || u.name || "User"}`,
      category: u.subscriptionTier || "free",
      progress: Math.floor(Math.random() * 40) + 60,
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
          fontSize: "24px",
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
          fontSize: "13px",
          color: "#6B6B6B",
          mb: 4,
        }}
      >
        Here's what's happening on your platform today.
      </Typography>

      {/* Stats Cards */}
      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 2,
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

  <Box sx={{ width: "100%", height: 350 }}>
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
  tick={{
    fill: "#929292",
    fontSize: 12,
    fontFamily: "Poppins",
    fontWeight: 500,
  }}
  axisLine={{ stroke: "#2A2A2A" }}
  tickLine={false}
/>

        <Area
          type="monotone"
          dataKey="users"
          stroke="#FFFFFF"
          strokeWidth={3}
          fill="url(#usersFill)"
        />

        <Area
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
    gridTemplateColumns: "1fr 1fr",
    gap: 3,
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