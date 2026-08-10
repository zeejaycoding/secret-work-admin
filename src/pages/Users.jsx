import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  Users,
  CreditCard,
  Crown,
  UserCheck,
  UserPlus,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  Ban,
  RotateCcw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import { getDashboardStats, getUsers, updateUser } from "../services/api";
import {
  getUserStatus,
  getPlanLabel,
  getRoleLabel,
  getUserName,
  formatDate,
  statusColors,
} from "../utils/userDisplay";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const csvCell = (value) => {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const formatWatchHours = (sec) => {
  const total = Number(sec) || 0;
  if (total <= 0) return "0 hrs";
  const hours = total / 3600;
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins} min`;
  }
  const rounded = hours < 10 ? Math.round(hours * 10) / 10 : Math.round(hours);
  return `${rounded} hrs`;
};

const exportUsersCsv = (list) => {
  const header = ["Name", "Email", "Plan", "Joined", "Watch (hours)", "Role", "Status"];
  const rows = list.map((u) => [
    getUserName(u),
    u.email || "",
    getPlanLabel(u),
    formatDate(u.createdAt),
    formatWatchHours(u.watchTimeSec),
    getRoleLabel(u),
    getUserStatus(u),
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const selectSx = {
  minWidth: 170,
  bgcolor: "#1F1F1F",
  borderRadius: "10px",
  color: "#fff",
  height: 44,

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2A2A2A",
  },

  "& .MuiSelect-select": {
    py: 1,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: "14px",
  },
};

export default function UsersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchUsers = (q, p, s) => {
    const params = {};
    if (q) params.search = q;
    if (p && p !== "all") params.plan = p;
    if (s && s !== "all") params.status = s;
    setUsersLoading(true);
    getUsers(params)
      .then((res) => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  };

  useEffect(() => {
    fetchUsers(search, plan, status);
  }, []);

  const toggleStatus = (u) => {
    const next = u.status === "suspended" ? "active" : "suspended";
    updateUser(u._id, { status: next })
      .then(() => fetchUsers(search, plan, status))
      .catch(() => {});
  };

  const newThisMonth = data?.monthlySignups?.length
    ? data.monthlySignups[data.monthlySignups.length - 1].count ?? "—"
    : "—";

  const stats = [
    {
      title: "Total Users",
      value: statsLoading ? "—" : data?.totalUsers?.toLocaleString() ?? "—",
      icon: Users,
    },
    {
      title: "Active Subscribers",
      value: statsLoading ? "—" : data?.activeSubscribers?.toLocaleString() ?? "—",
      icon: CreditCard,
    },
    {
      title: "Pro Users",
      value: statsLoading ? "—" : data?.proUsers?.toLocaleString() ?? "—",
      icon: Crown,
    },
    {
      title: "Free Users",
      value: statsLoading ? "—" : data?.freeUsers?.toLocaleString() ?? "—",
      icon: UserCheck,
    },
    {
      title: "New This Month",
      value: statsLoading ? "—" : String(newThisMonth).toLocaleString() ?? "—",
      icon: UserPlus,
    },
  ];

  const monthlyData = MONTHS.map((m, i) => {
    const match = (data?.monthlySignups || []).find((s) => s._id.month === i + 1);
    return { month: m, users: match?.count || 0 };
  });
  const maxUsers = monthlyData.reduce((max, d) => Math.max(max, d.users), 0);

  const selectMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: "#121212",
        border: "1px solid #1A1A1A",
        borderRadius: "10px",
        "& .MuiMenuItem-root": {
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: "14px",
          color: "#FFFFFF",
          "&:hover": { bgcolor: "#1F1F1F" },
          "&.Mui-selected": { bgcolor: "#2A2A2A" },
        },
      },
    },
  };

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
        <Users size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Users
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
            Users
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "12px", md: "13px" },
              color: "#6B6B6B",
            }}
          >
            Manage your app users and subscriptions.
          </Typography>
        </Box>

        <Button
          startIcon={<Download size={16} color="#FFFFFF" />}
          onClick={() => exportUsersCsv(users)}
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

      {/* User Growth */}
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
          User Growth
        </Typography>

        <Box sx={{ width: "100%", height: { xs: 220, sm: 280, md: 350 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
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

              <Tooltip
                cursor={{ fill: "#1A1A1A" }}
                contentStyle={{
                  backgroundColor: "#1F1F1F",
                  border: "1px solid #2A2A2A",
                  borderRadius: "10px",
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#FFFFFF" }}
                itemStyle={{ color: "#FFFFFF" }}
              />

              <Bar dataKey="users" radius={[6, 6, 0, 0]} barSize={54}>
                {monthlyData.map((d) => (
                  <Cell
                    key={d.month}
                    fill={maxUsers > 0 && d.users === maxUsers ? "#E50914" : "#2A2A2A"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Users Table */}
      <Box
        sx={{
          mt: 4,
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "10px",
          boxShadow: "0px 4px 20px #00000066",
          p: 2,
        }}
      >
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: { xs: "wrap", md: "nowrap" },
            px: 1,
            py: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 220 } }}>
            <TextField
              placeholder="Search"
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchUsers(search, plan, status);
              }}
              InputProps={{
                startAdornment: (
                  <Search
                    size={18}
                    color="#FFFFFF"
                    style={{ marginRight: 10 }}
                  />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 44,
                  bgcolor: "#1F1F1F",
                  borderRadius: "10px",
                  color: "#fff",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,

                  "& fieldset": {
                    borderColor: "#2A2A2A",
                  },

                  "&:hover fieldset": {
                    borderColor: "#2A2A2A",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#2A2A2A",
                  },
                },

                "& input::placeholder": {
                  color: "#A0A0A0",
                  opacity: 1,
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                },
              }}
            />
          </Box>

          <Select
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              fetchUsers(search, e.target.value, status);
            }}
            MenuProps={selectMenuProps}
            IconComponent={(props) => (
              <ChevronDown {...props} size={18} color="#929292" />
            )}
            sx={selectSx}
            renderValue={() => "All plans"}
          >
            <MenuItem value="all">All plans</MenuItem>
            <MenuItem value="free">Free</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="annual">Annual</MenuItem>
          </Select>

          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              fetchUsers(search, plan, e.target.value);
            }}
            MenuProps={selectMenuProps}
            IconComponent={(props) => (
              <ChevronDown {...props} size={18} color="#929292" />
            )}
            sx={selectSx}
            renderValue={() => "All statuses"}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </Box>

        {/* Desktop table */}
        <Box sx={{ px: 1, pb: 1, display: { xs: "none", sm: "block" } }}>
          <TableContainer sx={{ bgcolor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1F1F1F" }}>
                  {["User", "Plan", "Joined", "Watch (hours)", "Role", "Status", "Action"].map((col) => (
                    <TableCell
                      key={col}
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "#FFFFFF",
                        borderBottom: "1px solid #161616",
                        py: 1.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {usersLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ borderBottom: "none", py: 8 }}>
                      <Box
                        sx={{
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
                          Loading users...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ borderBottom: "none", py: 8 }}>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "#929292",
                          textAlign: "center",
                        }}
                      >
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const planLabel = getPlanLabel(u);
                    const stColor = statusColors[getUserStatus(u)] || statusColors.Active;
                    const role = getRoleLabel(u);

                    return (
                      <TableRow
                        key={u._id}
                        onClick={() => navigate(`/user/${u._id}`)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#111111" },
                        }}
                      >
                        <TableCell sx={cellSx}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "13px",
                                color: "#FFFFFF",
                                whiteSpace: "nowrap",
                                "&:hover": { color: "#E50914" },
                              }}
                            >
                              {getUserName(u)}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "11px",
                                color: "#929292",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {u.email}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Box
                            sx={{
                              border: "1px solid #2A2A2A",
                              borderRadius: "8px",
                              px: 1.5,
                              py: 0.6,
                              width: "fit-content",
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "12px",
                                color: "#FFFFFF",
                                textTransform: "capitalize",
                              }}
                            >
                              {planLabel}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Typography
                            sx={{
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              fontSize: "13px",
                              color: "#FFFFFF",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(u.createdAt)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Typography
                            sx={{
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              fontSize: "13px",
                              color: "#FFFFFF",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatWatchHours(u.watchTimeSec)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Typography
                            sx={{
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              fontSize: "13px",
                              color: "#FFFFFF",
                            }}
                          >
                            {role}
                          </Typography>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Box
                            sx={{
                              bgcolor: stColor.bg,
                              borderRadius: "8px",
                              px: 1.5,
                              py: 0.6,
                              width: "fit-content",
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "12px",
                                color: stColor.color,
                              }}
                            >
                              {getUserStatus(u)}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/user/${u._id}`);
                              }}
                              sx={{
                                bgcolor: "#1F1F1F",
                                border: "1px solid #2A2A2A",
                                borderRadius: "8px",
                                width: 32,
                                height: 32,
                                "&:hover": {
                                  bgcolor: "#1F1F1F",
                                  borderColor: "#3A3A3A",
                                },
                              }}
                            >
                              <Eye size={15} color="#FFFFFF" />
                            </IconButton>

                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStatus(u);
                              }}
                              sx={{
                                bgcolor: "#1F1F1F",
                                border: "1px solid #2A2A2A",
                                borderRadius: "8px",
                                width: 32,
                                height: 32,
                                "&:hover": {
                                  bgcolor: "#1F1F1F",
                                  borderColor:
                                    u.status === "suspended" ? "#22C55E" : "#E50914",
                                },
                              }}
                            >
                              {u.status === "suspended" ? (
                                <RotateCcw size={15} color="#22C55E" />
                              ) : (
                                <Ban size={15} color="#E50914" />
                              )}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Mobile cards */}
        <Box sx={{ display: { xs: "block", sm: "none" }, px: 1, pb: 2 }}>
          {usersLoading ? (
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
                Loading users...
              </Typography>
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ py: 8 }}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#929292",
                  textAlign: "center",
                }}
              >
                No users found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {users.map((u) => {
                const planLabel = getPlanLabel(u);
                const stColor = statusColors[getUserStatus(u)] || statusColors.Active;
                const role = getRoleLabel(u);
                const userStatus = getUserStatus(u);

                return (
                  <Box
                    key={u._id}
                    onClick={() => navigate(`/user/${u._id}`)}
                    sx={{
                      bgcolor: "#1A1A1A",
                      border: "1px solid #1F1F1F",
                      borderRadius: "10px",
                      p: 2,
                      cursor: "pointer",
                      "&:active": { bgcolor: "#222222" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "13px",
                            color: "#FFFFFF",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getUserName(u)}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "11px",
                            color: "#929292",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {u.email}
                        </Typography>
                      </Box>
                      <ChevronRight size={18} color="#929292" />
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mb: 1.5 }}>
                      <Box>
                        <Typography
                          sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "10px", color: "#6B6B6B", mb: 0.5 }}
                        >
                          Plan
                        </Typography>
                        <Box sx={{ border: "1px solid #2A2A2A", borderRadius: "8px", px: 1.4, py: 0.5, width: "fit-content" }}>
                          <Typography
                            sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: "#FFFFFF", textTransform: "capitalize" }}
                          >
                            {planLabel}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "10px", color: "#6B6B6B", mb: 0.5 }}
                        >
                          Joined
                        </Typography>
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: "#FFFFFF" }}>
                          {formatDate(u.createdAt)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "10px", color: "#6B6B6B", mb: 0.5 }}
                        >
                          Role
                        </Typography>
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: "#FFFFFF" }}>
                          {role}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "10px", color: "#6B6B6B", mb: 0.5 }}
                        >
                          Status
                        </Typography>
                        <Box sx={{ bgcolor: stColor.bg, borderRadius: "8px", px: 1.4, py: 0.5, width: "fit-content" }}>
                          <Typography
                            sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: stColor.color, textTransform: "capitalize" }}
                          >
                            {userStatus}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "10px", color: "#6B6B6B", mb: 0.5 }}
                        >
                          Watch (hours)
                        </Typography>
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: "#FFFFFF" }}>
                          {formatWatchHours(u.watchTimeSec)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${u._id}`);
                        }}
                        sx={{
                          bgcolor: "#1F1F1F",
                          border: "1px solid #2A2A2A",
                          borderRadius: "8px",
                          width: 32,
                          height: 32,
                          "&:hover": { bgcolor: "#1F1F1F", borderColor: "#3A3A3A" },
                        }}
                      >
                        <Eye size={15} color="#FFFFFF" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(u);
                        }}
                        sx={{
                          bgcolor: "#1F1F1F",
                          border: "1px solid #2A2A2A",
                          borderRadius: "8px",
                          width: 32,
                          height: 32,
                          "&:hover": { bgcolor: "#1F1F1F", borderColor: u.status === "suspended" ? "#22C55E" : "#E50914" },
                        }}
                      >
                        {u.status === "suspended" ? <RotateCcw size={15} color="#22C55E" /> : <Ban size={15} color="#E50914" />}
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const cellSx = {
  fontFamily: "Poppins",
  fontWeight: 500,
  fontSize: "13px",
  color: "#FFFFFF",
  borderBottom: "1px solid #161616",
  py: 1.8,
};
