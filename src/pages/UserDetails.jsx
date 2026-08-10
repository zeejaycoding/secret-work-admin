import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Divider, Snackbar, Alert } from "@mui/material";
import {
  ArrowLeft,
  Ban,
  RotateCcw,
  Mail,
  Key,
  CalendarDays,
  Eye,
  BookOpen,
  Files,
} from "lucide-react";

import { getUser, updateUser, resetUserPassword } from "../services/api";
import {
  getUserStatus,
  getPlanLabel,
  getUserName,
  formatDate,
  statusColors,
} from "../utils/userDisplay";

const MOCK_USER = {
  _id: "mock",
  firstName: "Jordan",
  lastName: "Carter",
  email: "jordan.carter@example.com",
  subscriptionTier: "pro",
  billingInterval: "annual",
  status: "active",
  role: "member",
  authProvider: "google",
  createdAt: new Date("2025-01-15T00:00:00.000Z"),
  subscriptionExpiry: new Date("2027-01-15T00:00:00.000Z"),
  watchTimeSec: 6320,
};

const MOCK_HISTORY = [
  { id: 1, title: "Killer Crossover", coach: "Coach Marcus", category: "Dribbling", views: "1.2k views" },
  { id: 2, title: "Spot Up Shooting", coach: "Coach Lisa", category: "Shooting", views: "980 views" },
  { id: 3, title: "Defensive Slide Drills", coach: "Coach Hudson", category: "Defence", views: "2.4k views" },
  { id: 4, title: "Outlet Passing", coach: "Coach Marcus", category: "Passing", views: "730 views" },
  { id: 5, title: "Hesitation Pull-Up", coach: "Coach Lisa", category: "Dribbling", views: "1.8k views" },
  { id: 6, title: "Closeout Mechanics", coach: "Coach Hudson", category: "Defence", views: "1.1k views" },
];

const MOCK_PROGRAMS = [
  { id: 1, name: "Beginner to Pro" },
  { id: 2, name: "Elite Guard Development" },
  { id: 3, name: "Big Man Fundamentals" },
  { id: 4, name: "Shooting Specialist" },
];

function formatViews(n) {
  if (!n) return "0 views";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k views";
  return n + " views";
}

function formatWatchHours(sec) {
  const total = Number(sec) || 0;
  if (total <= 0) return "0 hrs";
  const hours = total / 3600;
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins} min`;
  }
  const rounded = hours < 10 ? Math.round(hours * 10) / 10 : Math.round(hours);
  return `${rounded} hrs`;
}

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [drillHistory, setDrillHistory] = useState([]);
  const [enrolledPrograms, setEnrolledPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusPending, setStatusPending] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    let mounted = true;
    getUser(id)
      .then((res) => {
        if (!mounted) return;
        setUser(res.data.user);
        setDrillHistory(res.data.drillHistory || []);
        setEnrolledPrograms(res.data.enrolledPrograms || []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Get user failed:", err?.message || err);
        // Do not fabricate demo data. Show not-found/empty state instead.
        setUser(null);
        setDrillHistory([]);
        setEnrolledPrograms([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#E50914" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box>
        <Box
          onClick={() => navigate("/users")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            width: "fit-content",
            mb: 4,
          }}
        >
          <ArrowLeft size={18} color="#FFFFFF" />
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "13px",
              color: "#FFFFFF",
            }}
          >
            Back
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "18px",
            color: "#FFFFFF",
          }}
        >
          User not found
        </Typography>
      </Box>
    );
  }

  const status = getUserStatus(user);
  const st = statusColors[status] || statusColors.Active;
  const isSuspended = user.status === "suspended";

  const toggleStatus = async () => {
    if (user._id === "mock") {
      setUser({ ...user, status: isSuspended ? "active" : "suspended" });
      return;
    }

    const prev = user.status;
    const next = isSuspended ? "active" : "suspended";
    setStatusPending(true);
    setUser({ ...user, status: next });

    try {
      const res = await updateUser(user._id, { status: next });
      setUser(res.data.user);
      showSnackbar(
        next === "suspended"
          ? "User suspended. They can no longer sign in."
          : "User reactivated.",
      );
    } catch (err) {
      setUser({ ...user, status: prev });
      showSnackbar(
        err?.response?.data?.error || "Failed to update user status.",
        "error",
      );
    } finally {
      setStatusPending(false);
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:${user.email}`;
  };

  const handleResetPassword = async () => {
    if (user._id === "mock") {
      showSnackbar("This is demo data. Cannot send a real reset email.", "error");
      return;
    }

    setResetPending(true);
    try {
      const res = await resetUserPassword(user._id);
      showSnackbar(
        res?.data?.message || "Password reset email sent to the user.",
      );
    } catch (err) {
      showSnackbar(
        err?.response?.data?.error || "Failed to send password reset email.",
        "error",
      );
    } finally {
      setResetPending(false);
    }
  };

  return (
    <Box>
      {/* Back */}
      <Box
        onClick={() => navigate("/users")}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          width: "fit-content",
          mb: 4,
        }}
      >
        <ArrowLeft size={18} color="#FFFFFF" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#FFFFFF",
          }}
        >
          Back
        </Typography>
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexDirection: { xs: "column", md: "row" },
          gap: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "11px",
              color: "#929292",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            user
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "24px",
              color: "#FFFFFF",
              mt: 0.5,
            }}
          >
            {getUserName(user)}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#929292",
              }}
            >
              {user.email}
            </Typography>

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "18px",
                color: "#484848",
                lineHeight: 1,
              }}
            >
              •
            </Typography>

            
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#929292",
              }}
            >
              Joined {formatDate(user.createdAt)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5, flexWrap: "wrap" }}>
            <Box
              sx={{
                bgcolor: st.bg,
                borderRadius: "8px",
                px: 1.5,
                py: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: st.color,
                }}
              >
                {status}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "#1F1F1F",
                borderRadius: "8px",
                px: 1.5,
                py: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: "#FFFFFF",
                }}
              >
                {getPlanLabel(user)}
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: "#1F1F1F",
                borderRadius: "8px",
                px: 1.5,
                py: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                Watch: {formatWatchHours(user.watchTimeSec)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <Button
            startIcon={
              isSuspended ? (
                <RotateCcw size={15} color="#E50914" />
              ) : (
                <Ban size={15} color="#E50914" />
              )
            }
            onClick={toggleStatus}
            disabled={statusPending}
            sx={{
              bgcolor: "#1A0404",
              border: "1px solid #E50914",
              borderRadius: "10px",
              color: "#E50914",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "12px",
              px: 2.5,
              py: 1,
              justifyContent: "flex-start",
              "&:hover": {
                bgcolor: "#1A0404",
                borderColor: "#E50914",
              },
              "&.Mui-disabled": {
                bgcolor: "#1A0404",
                color: "#E50914",
                borderColor: "#E50914",
                opacity: 0.7,
              },
            }}
          >
            {statusPending ? (
              <CircularProgress size={14} sx={{ color: "#E50914" }} />
            ) : isSuspended ? (
              "Reactivate"
            ) : (
              "Suspend"
            )}
          </Button>

          <Button
            startIcon={<Mail size={15} color="#FFFFFF" />}
            onClick={handleEmail}
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
              justifyContent: "flex-start",
              "&:hover": {
                bgcolor: "#1F1F1F",
                borderColor: "#3A3A3A",
              },
            }}
          >
            Email
          </Button>

          <Button
            startIcon={<Key size={15} color="#FFFFFF" />}
            onClick={handleResetPassword}
            disabled={resetPending}
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
              justifyContent: "flex-start",
              "&:hover": {
                bgcolor: "#1F1F1F",
                borderColor: "#3A3A3A",
              },
              "&.Mui-disabled": {
                bgcolor: "#1F1F1F",
                color: "#D6D6D6",
                borderColor: "#2A2A2A",
                opacity: 0.7,
              },
            }}
          >
            {resetPending ? (
              <CircularProgress size={14} sx={{ color: "#FFFFFF" }} />
            ) : (
              "Reset password"
            )}
          </Button>
        </Box>
      </Box>

      {/* Drills History + Programs Enrolled */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2.5,
          mt: 2.5,
        }}
      >
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
            Drills History
          </Typography>

          {drillHistory.length === 0 ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              <Files size={28} color="#3A3A3A" />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#929292",
                }}
              >
                No drills completed yet
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
                gap: 2,
              }}
            >
              {drillHistory.map((drill) => (
                <Box
                  key={drill._id || drill.id}
                  onClick={() => navigate(`/drill/${drill._id || drill.id}`)}
                  sx={{
                    bgcolor: "#161616",
                    border: "1px solid #1F1F1F",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0px 4px 20px #00000066",
                    cursor: "pointer",
                    transition: ".25s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "#3A3A3A",
                      boxShadow: "0px 8px 28px #00000099",
                    },
                  }}
                >
                  {drill.imageUrl ? (
                    <Box
                      component="img"
                      src={drill.imageUrl}
                      alt={drill.title}
                      sx={{
                        width: "100%",
                        height: { xs: 90, sm: 110 },
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: { xs: 90, sm: 110 },
                        bgcolor: "#2A2A2A",
                      }}
                    />
                  )}

                  <Box sx={{ p: 1.5 }}>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#FFFFFF",
                        mb: 0.6,
                      }}
                    >
                      {drill.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "11px",
                        color: "#929292",
                        mb: 1.4,
                      }}
                    >
                      {drill.coach} • {drill.category}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                      <Eye size={15} color="#FFFFFF" />
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "11px",
                          color: "#929292",
                        }}
                      >
                        {formatViews(drill.views)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

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
              mb: 2,
            }}
          >
            Programs Enrolled
          </Typography>
          <Divider sx={{ bgcolor: "#1F1F1F", mb: 1 }} />
          {enrolledPrograms.length === 0 ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              <BookOpen size={28} color="#3A3A3A" />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#929292",
                }}
              >
                No programs enrolled yet
              </Typography>
            </Box>
          ) : (
            enrolledPrograms.map((p) => (
              <Box
                key={p._id || p.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1.5,
                  borderBottom: "1px solid #1F1F1F",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <BookOpen size={16} color="#484848" />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#FFFFFF",
                  }}
                >
                  {p.name}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            bgcolor: snackbar.severity === "error" ? "#1A0404" : "#132018",
            color: snackbar.severity === "error" ? "#E50914" : "#22C55E",
            fontFamily: "Inter",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
