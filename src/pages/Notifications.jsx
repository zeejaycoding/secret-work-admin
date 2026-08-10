import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Bell,
  BellDot,
  Inbox,
  Mail,
  Send,
  CalendarClock,
  Save,
  ChevronDown,
  Eye,
  Trash2,
  History,
} from "lucide-react";

import {
  getDashboardStats,
  getSubscriptions,
  getNotifications,
  createNotification,
  sendNotification,
  deleteNotification,
} from "../services/api";

const CHANNELS = [
  { key: "push", label: "Push", icon: Bell },
  { key: "inapp", label: "In-App", icon: Inbox },
  { key: "email", label: "Email", icon: Mail },
];

const AUDIENCES = [
  { value: "all", label: "All users" },
  { value: "free", label: "Free users" },
  { value: "pro", label: "Pro users (Monthly)" },
  { value: "annual", label: "Pro users (Annual)" },
  { value: "premium", label: "Premium users" },
];

const channelLabel = (key) =>
  CHANNELS.find((c) => c.key === key)?.label || "Push";

const audienceLabel = (value) =>
  AUDIENCES.find((a) => a.value === value)?.label || "All users";

const STATUS_STYLES = {
  Sent: { color: "#4CAF50", bg: "#1B3A1F" },
  Scheduled: { color: "#FFA000", bg: "#3A2E12" },
  Draft: { color: "#9E9E9E", bg: "#2A2A2A" },
  Failed: { color: "#E53935", bg: "#4A1518" },
};

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const normalizeNotification = (n) => ({
  id: n._id,
  channel: n.channel,
  audience: n.audience,
  title: n.title,
  message: n.message,
  reach: typeof n.reach === "number" ? n.reach : null,
  date: n.scheduledAt || n.createdAt,
  status:
    n.status === "sent"
      ? "Sent"
      : n.status === "scheduled"
      ? "Scheduled"
      : n.status === "failed"
      ? "Failed"
      : "Draft",
});

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#1F1F1F",
    borderRadius: "10px",
    "& fieldset": { borderColor: "#2A2A2A" },
    "&:hover fieldset": { borderColor: "#3A3A3A" },
    "&.Mui-focused fieldset": { borderColor: "#E50914" },
  },
  "& input::placeholder": {
    color: "#5A5A5A",
    opacity: 1,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: "14px",
  },
  "& textarea::placeholder": {
    color: "#5A5A5A",
    opacity: 1,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: "14px",
  },
};

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

export default function NotificationsPage() {
  const [channel, setChannel] = useState("push");
  const [audience, setAudience] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const [history, setHistory] = useState([]);
  const [reachMap, setReachMap] = useState({
    all: null,
    free: null,
    monthly: null,
    annual: null,
  });

  const HISTORY_KEY = "secretwork-admin-notification-history";

  const persistHistory = (next) => {
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage errors */
    }
  };

  useEffect(() => {
    getNotifications()
      .then((res) => {
        const list = (res.data.notifications || []).map(normalizeNotification);
        persistHistory(list);
      })
      .catch(() => {
        try {
          const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
          if (Array.isArray(stored)) setHistory(stored);
        } catch {
          /* ignore corrupted storage */
        }
      });

    getDashboardStats()
      .then((res) =>
        setReachMap((m) => ({
          ...m,
          all: res.data.totalUsers ?? null,
        }))
      )
      .catch(() => {});

    getSubscriptions()
      .then((res) => {
        const pb = res.data.planBreakdown || [];
        const find = (k) => {
          const p = pb.find((x) => x.key === k);
          return p && typeof p.count === "number" ? p.count : null;
        };
        setReachMap((m) => ({
          ...m,
          free: find("free"),
          monthly: find("monthly"),
          annual: find("annual"),
        }));
      })
      .catch(() => {});
  }, []);

  const reachFor = (audience) => {
    const count = reachMap[audience];
    return typeof count === "number" ? count : null;
  };

  const createCampaign = async ({ status, scheduledAt }) => {
    const payload = {
      channel,
      audience,
      title: title.trim(),
      message: message.trim(),
      status,
      ...(scheduledAt ? { scheduledAt } : {}),
    };
    // include client timezone offset for server-side parsing of naive datetimes
    const tzOffset = String(new Date().getTimezoneOffset());
    const config = { headers: { "X-Client-Timezone-Offset": tzOffset } };
    try {
      const res = await createNotification(payload, config);
      const entry = normalizeNotification(res.data.notification);
      persistHistory([entry, ...history]);
      return { ok: true };
    } catch (err) {
      const fallback = {
        id: `local-${Date.now()}`,
        channel,
        audience,
        title: title.trim() || "Untitled",
        message: message.trim(),
        reach: reachFor(audience),
        date: new Date().toISOString(),
        status:
          status === "sent"
            ? "Sent"
            : status === "scheduled"
            ? "Scheduled"
            : "Draft",
      };
      persistHistory([fallback, ...history]);
      return { ok: false };
    }
  };

  const removeHistory = (id) => {
    const next = history.filter((h) => h.id !== id);
    persistHistory(next);
    deleteNotification(id).catch(() => {
      showSnackbar("Removed locally — backend unreachable", "error");
    });
  };

  const viewHistory = (entry) => {
    showSnackbar(
      `${channelLabel(entry.channel)} · ${entry.title}: ${
        entry.message || "No message"
      }`,
      "info"
    );
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const validate = () => {
    if (!title.trim() || !message.trim()) {
      showSnackbar("Please enter both a title and a message", "error");
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      const { ok } = await createCampaign({ status: "sent" });
      showSnackbar(
        ok
          ? `${channelLabel(channel)} notification sent to ${audienceLabel(
              audience
            )}`
          : "Notification saved locally — backend unreachable",
        ok ? "success" : "error"
      );
      setTitle("");
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const openSchedule = () => {
    if (!validate()) return;
    setScheduleTime("");
    setScheduleOpen(true);
  };

  const handleSchedule = async () => {
    if (!scheduleTime) {
      showSnackbar("Pick a date and time to schedule", "error");
      return;
    }
    setScheduling(true);
    try {
      const { ok } = await createCampaign({
        status: "scheduled",
        scheduledAt: scheduleTime,
      });
      const readable = new Date(scheduleTime).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      showSnackbar(
        ok
          ? `${channelLabel(channel)} notification scheduled for ${readable}`
          : "Saved locally — backend unreachable",
        ok ? "success" : "error"
      );
      setScheduleOpen(false);
      setTitle("");
      setMessage("");
    } finally {
      setScheduling(false);
    }
  };

  const handleDraft = async () => {
    if (!title.trim() && !message.trim()) {
      showSnackbar("Nothing to save yet", "error");
      return;
    }
    try {
      const drafts = JSON.parse(
        localStorage.getItem("secretwork-admin-notification-drafts") || "[]"
      );
      drafts.push({
        channel,
        audience,
        title,
        message,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "secretwork-admin-notification-drafts",
        JSON.stringify(drafts)
      );
      const { ok } = await createCampaign({ status: "draft" });
      showSnackbar(
        ok ? "Draft saved" : "Draft saved locally — backend unreachable",
        ok ? "success" : "error"
      );
    } catch {
      showSnackbar("Could not save draft", "error");
    }
  };

  const ActiveIcon = CHANNELS.find((c) => c.key === channel)?.icon || Bell;

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <BellDot size={20} color="#929292" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Insights
        </Typography>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#4A4A4A",
          }}
        >
          /
        </Typography>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#FFFFFF",
          }}
        >
          Notifications
        </Typography>
      </Box>

      {/* Heading */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: { xs: "18px", sm: "20px", md: "24px" },
            color: "#FFFFFF",
            mb: 0.5,
          }}
        >
          Notifications
        </Typography>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "12px", md: "13px" },
            color: "#6B6B6B",
          }}
        >
          Reach users via push, in-app and email.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "60fr 40fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* ── Compose (60%) ── */}
        <Box
          sx={{
            bgcolor: "#1A1A1A",
            
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
              mb: 2.5,
            }}
          >
            Compose
          </Typography>

          {/* Tabs */}
          <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              const active = channel === c.key;
              return (
                <Box
                  key={c.key}
                  onClick={() => setChannel(c.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2.5,
                    py: 1.2,
                    borderRadius: "10px",
                    cursor: "pointer",
                    bgcolor: active ? "#FFFFFF" : "#1A1A1A",
                    border: active
                      ? "1px solid #FFFFFF"
                      : "1px solid #FFFFFF",
                    transition: "all .2s",
                    "&:hover": { bgcolor: active ? "#FFFFFF" : "#242424" },
                  }}
                >
                  <Icon size={16} color={active ? "#111111" : "#FFFFFF"} />
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: active ? "#111111" : "#FFFFFF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Audience */}
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              color: "#7A7A7A",
              mb: 1,
            }}
          >
            Audience
          </Typography>
          <Select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            MenuProps={selectMenuProps}
            IconComponent={(props) => (
              <ChevronDown {...props} size={18} color="#929292" />
            )}
            sx={{
              width: "100%",
              bgcolor: "#1F1F1F",
              borderRadius: "10px",
              color: "#fff",
              height: 44,
              mb: 2.5,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#2A2A2A",
              },
              "& .MuiSelect-select": {
                py: 1,
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
              },
            }}
          >
            {AUDIENCES.map((a) => (
              <MenuItem key={a.value} value={a.value}>
                {a.label}
              </MenuItem>
            ))}
          </Select>

          {/* Title */}
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              color: "#7A7A7A",
              mb: 1,
            }}
          >
            Title
          </Typography>
          <TextField
            fullWidth
            placeholder="Write a catchy headline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            inputProps={{
              sx: {
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#FFFFFF",
                "&::placeholder": { color: "#5A5A5A", opacity: 1 },
              },
            }}
            sx={{ ...fieldSx, mb: 2.5 }}
          />

          {/* Message */}
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              color: "#7A7A7A",
              mb: 1,
            }}
          >
            Message
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            placeholder="What's the message?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            inputProps={{
              sx: {
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#FFFFFF",
                lineHeight: 1.6,
              },
            }}
            sx={fieldSx}
          />

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mt: 3,
              flexWrap: "wrap",
            }}
          >
            <Button
              startIcon={
                <Send size={15} color="#FFFFFF" strokeWidth={2.2} />
              }
              onClick={handleSend}
              disabled={sending}
              sx={{
                bgcolor: "#E50914",
                borderRadius: "10px",
                color: "#FFFFFF",
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                px: 3,
                py: 1.2,
                boxShadow: "0px 4px 15px #F81B1B40",
                "&:hover": { bgcolor: "#C10812" },
                "&:disabled": { bgcolor: "#7A1A1F", color: "#FFFFFF80" },
              }}
            >
              {sending ? "Sending..." : "Send Now"}
            </Button>

            <Button
              startIcon={<CalendarClock size={15} color="#D6D6D6" />}
              onClick={openSchedule}
              sx={{
                bgcolor: "#2A2A2A",
                borderRadius: "10px",
                color: "#D6D6D6",
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                px: 3,
                py: 1.2,
                "&:hover": { bgcolor: "#363636" },
              }}
            >
              Schedule
            </Button>

            <Button
              startIcon={<Save size={15} color="#D6D6D6" />}
              onClick={handleDraft}
              sx={{
                bgcolor: "#2A2A2A",
                borderRadius: "10px",
                color: "#D6D6D6",
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                px: 3,
                py: 1.2,
                "&:hover": { bgcolor: "#363636" },
              }}
            >
              Draft
            </Button>
          </Box>
        </Box>

        {/* ── Preview (40%) ── */}
        <Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "16px",
              color: "#FFFFFF",
              mb: 2.5,
            }}
          >
            Preview
          </Typography>

          <Box
            sx={{
              bgcolor: "#1F1F1F",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              p: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "#E50914",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ActiveIcon size={20} color="#FFFFFF" />
              </Box>

              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "#FFFFFF",
                  flex: 1,
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                {title.trim() || "New notification"}
              </Typography>

              <Box
                sx={{
                  bgcolor: "#2A2A2A",
                  borderRadius: "999px",
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "11px",
                    color: "#FFFFFF",
                  }}
                >
                  {channelLabel(channel)}
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#6B6B6B",
                mt: 2,
                lineHeight: 1.6,
                wordBreak: "break-word",
              }}
            >
              {message.trim() || "Your message preview appears here."}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Notification History ── */}
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <History size={18} color="#E50914" />
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "16px",
                color: "#FFFFFF",
              }}
            >
              Notification History
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "12px",
              color: "#6B6B6B",
            }}
          >
            {history.length} {history.length === 1 ? "entry" : "entries"}
          </Typography>
        </Box>

        {history.length === 0 ? (
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              color: "#929292",
              textAlign: "center",
              py: 5,
            }}
          >
            No notifications sent yet. Compose one above.
          </Typography>
        ) : (
          <TableContainer
            sx={{
              bgcolor: "transparent",
              border: "1px solid #161616",
              borderRadius: "10px",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#242424" }}>
                  {[
                    "Title",
                    "Audience",
                    "Channel",
                    "Reach",
                    "Date",
                    "Status",
                    "Action",
                  ].map((col) => (
                    <TableCell
                      key={col}
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "13px",
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
                {history.map((h) => {
                  const st = STATUS_STYLES[h.status] || STATUS_STYLES.Draft;
                  return (
                    <TableRow
                      key={h.id}
                      sx={{
                        bgcolor: "#1F1F1F",
                        "&:last-child td": { borderBottom: "none" },
                        "&:hover": { bgcolor: "#242424" },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "13px",
                          color: "#FFFFFF",
                          borderBottom: "1px solid #161616",
                          py: 1.5,
                          maxWidth: 260,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h.title}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "13px",
                          color: "#D6D6D6",
                          borderBottom: "1px solid #161616",
                          py: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {audienceLabel(h.audience)}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "13px",
                          color: "#D6D6D6",
                          borderBottom: "1px solid #161616",
                          py: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {channelLabel(h.channel)}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "13px",
                          color: "#FFFFFF",
                          borderBottom: "1px solid #161616",
                          py: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {typeof h.reach === "number" ? h.reach : "—"}
                      </TableCell>

                      <TableCell
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "13px",
                          color: "#929292",
                          borderBottom: "1px solid #161616",
                          py: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDateTime(h.date)}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom: "1px solid #161616",
                          py: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "999px",
                            bgcolor: st.bg,
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 500,
                              fontSize: "11px",
                              color: st.color,
                            }}
                          >
                            {h.status}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom: "1px solid #161616",
                          py: 1.5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => viewHistory(h)}
                          sx={{ color: "#929292", "&:hover": { color: "#FFFFFF" } }}
                        >
                          <Eye size={16} />
                        </IconButton>
                        {h.status === "Draft" && !String(h.id).startsWith("local-") && (
                          <IconButton
                            size="small"
                            onClick={async () => {
                              try {
                                const res = await sendNotification(h.id);
                                const updated = normalizeNotification(res.data.notification);
                                const next = history.map((x) => (x.id === h.id ? updated : x));
                                persistHistory(next);
                                showSnackbar("Draft sent", "success");
                              } catch (err) {
                                showSnackbar("Failed to send draft", "error");
                              }
                            }}
                            sx={{ color: "#929292", "&:hover": { color: "#FFFFFF" } }}
                          >
                            <Send size={16} />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => removeHistory(h.id)}
                          sx={{ color: "#929292", "&:hover": { color: "#E50914" } }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Schedule dialog */}
      <Dialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            border: "1px solid #2A2A2A",
            borderRadius: "12px",
            width: 420,
            maxWidth: "92vw",
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "16px",
            color: "#FFFFFF",
          }}
        >
          Schedule Notification
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "13px",
              color: "#6B6B6B",
              mb: 2,
            }}
          >
            {channelLabel(channel)} · {audienceLabel(audience)}
          </Typography>

          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "12px",
              color: "#7A7A7A",
              mb: 1,
            }}
          >
            Send at
          </Typography>
          <TextField
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            fullWidth
            inputProps={{
              sx: {
                colorScheme: "dark",
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#FFFFFF",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#1F1F1F",
                borderRadius: "10px",
                "& fieldset": { borderColor: "#2A2A2A" },
                "&.Mui-focused fieldset": { borderColor: "#E50914" },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setScheduleOpen(false)}
            sx={{
              bgcolor: "#2A2A2A",
              borderRadius: "10px",
              color: "#D6D6D6",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "12px",
              px: 2.5,
              "&:hover": { bgcolor: "#363636" },
            }}
          >
            Cancel
          </Button>
          <Button
            startIcon={
              scheduling ? (
                <Box sx={{ width: 14, height: 14 }} />
              ) : (
                <CalendarClock size={14} color="#FFFFFF" />
              )
            }
            onClick={handleSchedule}
            disabled={scheduling}
            sx={{
              bgcolor: "#E50914",
              borderRadius: "10px",
              color: "#FFFFFF",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "12px",
              px: 2.5,
              boxShadow: "0px 4px 15px #F81B1B40",
              "&:hover": { bgcolor: "#C10812" },
            }}
          >
            {scheduling ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            bgcolor: {
              success: "#1B5E20",
              error: "#B71C1C",
              info: "#1565C0",
            }[snackbar.severity] || "#B71C1C",
            fontFamily: "Inter",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
