import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Tab,
  Tabs,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Download,
  Search,
  ExternalLink,
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

import { getSubscriptions } from "../services/api";
import usePolling from "../hooks/usePolling";

const csvCell = (value) => {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const exportTransactionsCsv = (list) => {
  const header = ["ID", "User", "Email", "Plan", "Amount", "Status", "Date"];
  const rows = list.map((t) => [
    t.stripeInvoiceId || t.stripeChargeId || t._id || "",
    t.userName || "",
    t.userEmail || "",
    getPlanLabel(t.plan),
    `$${(t.amount || 0).toFixed(2)}`,
    t.status || "",
    formatDate(t.date),
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const getPlanLabel = (plan) => {
  if (plan === "annual") return "Annual Pro";
  if (plan === "monthly") return "Monthly Pro";
  return "—";
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusStyles = {
  success: { bg: "rgba(34, 197, 94, 0.12)", color: "#22C55E" },
  failed: { bg: "rgba(229, 9, 20, 0.12)", color: "#E50914" },
  refunded: { bg: "rgba(234, 179, 8, 0.12)", color: "#EAB308" },
  cancelled: { bg: "rgba(146, 146, 146, 0.12)", color: "#929292" },
};

const planStyles = {
  monthly: { bg: "rgba(229, 9, 20, 0.12)", color: "#E50914" },
  annual: { bg: "rgba(59, 130, 246, 0.12)", color: "#3B82F6" },
};

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const hasLoaded = useRef(false);

  const fetchData = (t, q) => {
    const params = {};
    if (t && t !== "all") params.tab = t;
    if (q) params.search = q;
    if (!hasLoaded.current) setLoading(true);
    getSubscriptions(params)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => {
        hasLoaded.current = true;
        setLoading(false);
      });
  };

  usePolling(() => fetchData(tab, search), 30000);

  const changeTab = (t) => {
    setTab(t);
    fetchData(t, search);
  };

  const runSearch = () => {
    fetchData(tab, search);
  };

  const stats = data?.stats
    ? [
        {
          title: "MRR",
          value: `$${data.stats.mrr.toLocaleString()}`,
          icon: DollarSign,
        },
        {
          title: "Active Subscriptions",
          value: data.stats.activeSubscriptions.toLocaleString(),
          icon: Users,
        },
        {
          title: "Churn Rate",
          value: `${data.stats.churnRate}%`,
          icon: TrendingUp,
        },
        {
          title: "Failed Payments",
          value: data.stats.failedCount.toLocaleString(),
          icon: AlertTriangle,
        },
        {
          title: "Total Revenue",
          value: `$${data.stats.totalRevenue.toLocaleString()}`,
          icon: CreditCard,
        },
      ]
    : [];

  const formatDay = (dateStr) => {
    if (!dateStr) return "";
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
      );
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    return String(dateStr);
  };

  const chartData = (data?.dailyRevenue || []).map((d) => ({
    ...d,
    label: formatDay(d.date),
  }));

  const transactions = data?.transactions || [];

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <CreditCard size={20} color="#929292" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Subscriptions
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
            Subscriptions
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "12px", md: "13px" },
              color: "#6B6B6B",
            }}
          >
            Plans, revenue and transactions across the platform.
          </Typography>
        </Box>

        <Button
          startIcon={<Download size={16} color="#FFFFFF" />}
          onClick={() => exportTransactionsCsv(transactions)}
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
            sm: "repeat(3, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {(loading ? [0, 1, 2, 3, 4] : stats).map((item, i) => {
          const Icon = loading ? CreditCard : item.icon;

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
                  {loading ? "—" : item.title}
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

      {/* 70/30 Row: Revenue chart + Plans */}
      <Box
        sx={{
          mt: 4,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "7fr 3fr" },
          gap: { xs: 2, lg: 3 },
        }}
      >
        {/* Revenue chart */}
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
              fontSize: "16px",
              color: "#FFFFFF",
              mb: 0.5,
            }}
          >
            Revenue (Last 14 Days)
          </Typography>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "11px",
              color: "#6B6B6B",
              mb: 3,
            }}
          >
            Successful payments per day
          </Typography>

          <Box sx={{ width: "100%", height: { xs: 240, md: 300 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#E50914" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#E50914" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="#2A2A2A"
                    strokeDasharray="0"
                  />
                  <XAxis
                    dataKey="label"
                    interval={0}
                    tickMargin={10}
                    padding={{ left: 16, right: 36 }}
                    tick={{
                      fill: "#929292",
                      fontSize: 11,
                      fontFamily: "Poppins",
                      fontWeight: 500,
                    }}
                    axisLine={{ stroke: "#2A2A2A" }}
                    tickLine={false}
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
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    cursor={{ stroke: "#2A2A2A" }}
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
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E50914"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
          </Box>
        </Box>

        {/* Plans panel */}
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
              fontSize: "16px",
              color: "#FFFFFF",
              mb: 3,
            }}
          >
            Plans
          </Typography>

          {(data?.planBreakdown || []).map((p) => {
            const label =
              p.plan === "Free"
                ? "Free"
                : p.plan === "Monthly Pro"
                ? "Monthly"
                : p.plan === "Annual Pro"
                ? "Annually"
                : p.plan;
            const price = p.priceLabel || p.price;

            return (
              <Box
                key={p.plan}
                onClick={() => p.key && navigate(`/plan/${p.key}`)}
                sx={{
                  bgcolor: "#1F1F1F",
                  border: "1px solid #1F1F1F",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 20px #00000066",
                  p: 2,
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  cursor: p.key ? "pointer" : "default",
                  transition: "all .2s",
                  "&:hover": {
                    borderColor: "#3A3A3A",
                  },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "#FFFFFF",
                      mb: 0.5,
                    }}
                  >
                    {label}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "10px",
                      color: "#929292",
                    }}
                  >
                    {p.count.toLocaleString()}{" "}
                    {p.count === 1 ? "subscriber" : "subscribers"}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: "#2A2A2A",
                    border: "1px solid #3A3A3A",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.6,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#D6D6D6",
                    }}
                  >
                    {price}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          {!loading && !(data?.planBreakdown || []).length && (
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "13px",
                color: "#929292",
                textAlign: "center",
                py: 4,
              }}
            >
              No plan data
            </Typography>
          )}
        </Box>
      </Box>

      {/* Transactions table */}
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
        {/* Tabs + search */}
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
          <Tabs
            value={tab}
            onChange={(e, v) => changeTab(v)}
            TabIndicatorProps={{
              style: { backgroundColor: "#E50914" },
            }}
            sx={{
              "& .MuiTab-root": {
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#929292",
                textTransform: "none",
                minHeight: 44,
                px: { xs: 1.5, sm: 2.5 },
                "&.Mui-selected": { color: "#FFFFFF" },
              },
            }}
          >
            <Tab label="All" value="all" />
            <Tab label="Failed" value="failed" />
            <Tab label="Refunds" value="refunds" />
          </Tabs>

          <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 240 } }}>
            <TextField
              placeholder="Search by user or email"
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              InputProps={{
                startAdornment: (
                  <Search size={18} color="#FFFFFF" style={{ marginRight: 10 }} />
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

                  "& fieldset": { borderColor: "#2A2A2A" },
                  "&:hover fieldset": { borderColor: "#2A2A2A" },
                  "&.Mui-focused fieldset": { borderColor: "#2A2A2A" },
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
        </Box>

        {/* Table */}
        <Box sx={{ px: 1, pb: 1, display: { xs: "none", sm: "block" } }}>
          <TableContainer sx={{ bgcolor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1F1F1F" }}>
                  {["ID", "User", "Plan", "Amount", "Status", "Date", "Action"].map(
                    (col) => (
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
                    )
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
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
                          Loading transactions...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
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
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => {
                    const st = statusStyles[t.status] || statusStyles.cancelled;
                    const pl = planStyles[t.plan];

                    return (
                      <TableRow
                        key={t._id}
                        sx={{
                          "&:hover": { bgcolor: "#111111" },
                        }}
                      >
                        <TableCell sx={cellSx}>
                          <Typography
                            sx={{
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              fontSize: "12px",
                              color: "#929292",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.stripeInvoiceId || t.stripeChargeId || t._id || "—"}
                          </Typography>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "13px",
                                color: "#FFFFFF",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.userName || "—"}
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
                              {t.userEmail}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          {t.plan ? (
                            <Box
                              sx={{
                                bgcolor: pl.bg,
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
                                  color: pl.color,
                                }}
                              >
                                {getPlanLabel(t.plan)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "13px",
                                color: "#929292",
                              }}
                            >
                              —
                            </Typography>
                          )}
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
                            ${(t.amount || 0).toFixed(2)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Box
                            sx={{
                              bgcolor: st.bg,
                              borderRadius: "8px",
                              px: 1.5,
                              py: 0.6,
                              width: "fit-content",
                              textTransform: "capitalize",
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "12px",
                                color: st.color,
                              }}
                            >
                              {t.status || "—"}
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
                            {formatDate(t.date)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Button
                            onClick={() => {
                              const id = t.stripeInvoiceId || t.stripeChargeId;
                              if (id) {
                                window.open(
                                  `https://dashboard.stripe.com/payments/${id}`,
                                  "_blank"
                                );
                              }
                            }}
                            disabled={!(t.stripeInvoiceId || t.stripeChargeId)}
                            startIcon={<ExternalLink size={14} />}
                            sx={{
                              bgcolor: "#1F1F1F",
                              border: "1px solid #2A2A2A",
                              borderRadius: "8px",
                              color: "#FFFFFF",
                              textTransform: "none",
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              fontSize: "12px",
                              px: 1.5,
                              py: 0.6,
                              minWidth: 0,

                              "&:hover": {
                                bgcolor: "#1F1F1F",
                                borderColor: "#3A3A3A",
                              },
                              "&:disabled": {
                                color: "#4A4A4A",
                              },
                            }}
                          >
                            View
                          </Button>
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
                Loading transactions...
              </Typography>
            </Box>
          ) : transactions.length === 0 ? (
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
                No transactions found
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {transactions.map((t) => {
                const st = statusStyles[t.status] || statusStyles.cancelled;
                const pl = planStyles[t.plan];

                return (
                  <Box
                    key={t._id}
                    sx={{
                      bgcolor: "#1A1A1A",
                      border: "1px solid #1F1F1F",
                      borderRadius: "10px",
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
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
                          {t.userName || "—"}
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
                          {t.userEmail}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: st.bg,
                          borderRadius: "8px",
                          px: 1.4,
                          py: 0.5,
                          textTransform: "capitalize",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "12px",
                            color: st.color,
                          }}
                        >
                          {t.status || "—"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "10px",
                            color: "#6B6B6B",
                            mb: 0.5,
                          }}
                        >
                          Plan
                        </Typography>
                        {t.plan ? (
                          <Box
                            sx={{
                              bgcolor: pl.bg,
                              borderRadius: "8px",
                              px: 1.4,
                              py: 0.5,
                              width: "fit-content",
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                fontSize: "12px",
                                color: pl.color,
                              }}
                            >
                              {getPlanLabel(t.plan)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            sx={{
                              fontFamily: "Poppins",
                              fontWeight: 500,
                              fontSize: "12px",
                              color: "#929292",
                            }}
                          >
                            —
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "10px",
                            color: "#6B6B6B",
                            mb: 0.5,
                          }}
                        >
                          Amount
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                        >
                          ${(t.amount || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "10px",
                            color: "#6B6B6B",
                            mb: 0.5,
                          }}
                        >
                          Date
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "12px",
                            color: "#FFFFFF",
                          }}
                        >
                          {formatDate(t.date)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "10px",
                            color: "#6B6B6B",
                            mb: 0.5,
                          }}
                        >
                          ID
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
                          {t.stripeInvoiceId || t.stripeChargeId || t._id || "—"}
                        </Typography>
                      </Box>
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
