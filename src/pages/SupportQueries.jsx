import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Avatar,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  MessageSquare,
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  Mail,
  User,
  Inbox,
  Check,
} from "lucide-react";
import {
  getSupportQueries,
  getSupportQuery,
  replySupportQuery,
} from "../services/api";

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

const formatTime = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function SupportQueries() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [thread, setThread] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const threadEndRef = useRef(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const loadQueries = useCallback(async () => {
    try {
      const res = await getSupportQueries();
      const list = res.data.queries || [];
      setQueries(list);
      setLoading(false);
      if (selectedRoom) {
        const stillThere = list.some((q) => q.room === selectedRoom);
        if (!stillThere) setSelectedRoom(null);
      }
    } catch {
      setLoading(false);
    }
  }, [selectedRoom]);

  useEffect(() => {
    loadQueries();
    const interval = setInterval(loadQueries, 15000);
    return () => clearInterval(interval);
  }, [loadQueries]);

  const openThread = useCallback(async (room) => {
    setSelectedRoom(room);
    setReply("");
    setThreadLoading(true);
    setThread(null);
    try {
      const res = await getSupportQuery(room);
      setThread(res.data);
    } catch {
      showSnackbar("Failed to load conversation", "error");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length, threadLoading]);

  const handleSend = async () => {
    const trimmed = reply.trim();
    if (!trimmed || !selectedRoom) return;
    setSending(true);
    try {
      const res = await replySupportQuery(selectedRoom, trimmed);
      setReply("");
      showSnackbar(res.data.message || "Reply sent", "success");
      await Promise.all([loadQueries(), openThread(selectedRoom)]);
    } catch (err) {
      const msg =
        err.response?.data?.error || "Failed to send reply. Try again.";
      showSnackbar(msg, "error");
    } finally {
      setSending(false);
    }
  };

  const filtered = queries.filter((q) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    const name = (q.user?.name || "").toLowerCase();
    const email = (q.user?.email || "").toLowerCase();
    const text = (q.lastQuery || "").toLowerCase();
    return (
      name.includes(s) || email.includes(s) || text.includes(s) || q.room.includes(s)
    );
  });

  const selected = queries.find((q) => q.room === selectedRoom);

  const showList = !isMobile || !selectedRoom;

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <MessageSquare size={20} color="#929292" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          People
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
          Support Queries
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
          Support Queries
        </Typography>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "12px", md: "13px" },
            color: "#6B6B6B",
          }}
        >
          View messages sent from Live Chat and reply by email.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "38fr 62fr" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {/* ── Conversations list ── */}
        {showList && (
          <Box
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              overflow: "hidden",
              minHeight: 480,
            }}
          >
            <Box sx={{ p: 2.5, pb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <MessageCircle size={18} color="#E50914" />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "16px",
                    color: "#FFFFFF",
                    flex: 1,
                  }}
                >
                  Conversations
                </Typography>
                <Box
                  sx={{
                    bgcolor: "#242424",
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
                      color: "#D6D6D6",
                    }}
                  >
                    {filtered.length}
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                placeholder="Search user, email or message"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search size={16} color="#5A5A5A" style={{ marginRight: 8 }} />
                  ),
                }}
                inputProps={{
                  sx: {
                    fontFamily: "Inter",
                    fontSize: "13px",
                    color: "#FFFFFF",
                    py: 1.2,
                  },
                }}
                sx={fieldSx}
              />
            </Box>

            <Box
              sx={{
                maxHeight: 520,
                overflowY: "auto",
                scrollbarWidth: "thin",
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={24} sx={{ color: "#E50914" }} />
                </Box>
              ) : filtered.length === 0 ? (
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#6B6B6B",
                    textAlign: "center",
                    py: 6,
                  }}
                >
                  {queries.length === 0
                    ? "No conversations yet."
                    : "No results for your search."}
                </Typography>
              ) : (
                filtered.map((q) => {
                  const active = q.room === selectedRoom;
                  const isNew = q.status === "new";
                  return (
                    <Box
                      key={q.room}
                      onClick={() => openThread(q.room)}
                      sx={{
                        px: 2.5,
                        py: 2,
                        cursor: "pointer",
                        borderBottom: "1px solid #1F1F1F",
                        bgcolor: active ? "#242424" : "transparent",
                        borderLeft: active ? "3px solid #E50914" : "3px solid transparent",
                        transition: "all .15s",
                        "&:hover": { bgcolor: "#1F1F1F" },
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1.5 }}>
                        <Avatar
                          src={q.user?.avatarUrl || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "#3A3A3A",
                            fontSize: 15,
                          }}
                        >
                          {(q.user?.name || "?").charAt(0).toUpperCase()}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Poppins",
                                fontWeight: 600,
                                fontSize: "13px",
                                color: "#FFFFFF",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {q.user?.name || "Unknown user"}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "11px",
                                color: "#6B6B6B",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatTime(q.lastAt)}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 500,
                              fontSize: "11px",
                              color: "#929292",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              mb: 0.5,
                            }}
                          >
                            {q.user?.email || "no email"}
                          </Typography>

                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontWeight: 500,
                              fontSize: "13px",
                              color: isNew ? "#FFFFFF" : "#929292",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {q.lastQuery || "..."}
                          </Typography>
                        </Box>

                        {isNew && (
                          <Box
                            sx={{
                              alignSelf: "center",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#E50914",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        )}

        {/* ── Thread + reply ── */}
        {!showList || selectedRoom ? (
          <Box
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              overflow: "hidden",
              minHeight: 480,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {!selectedRoom ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  py: 8,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    bgcolor: "#1F1F1F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Inbox size={24} color="#6B6B6B" />
                </Box>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#6B6B6B",
                  }}
                >
                  Select a conversation to view and reply.
                </Typography>
              </Box>
            ) : threadLoading && !thread ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                }}
              >
                <CircularProgress size={26} sx={{ color: "#E50914" }} />
              </Box>
            ) : thread ? (
              <>
                {/* Thread header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid #1F1F1F",
                    bgcolor: "#1A1A1A",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  {isMobile && (
                    <Button
                      onClick={() => setSelectedRoom(null)}
                      sx={{
                        minWidth: 0,
                        color: "#D6D6D6",
                        p: 1,
                      }}
                    >
                      <ArrowLeft size={18} />
                    </Button>
                  )}

                  <Avatar
                    src={thread.user?.avatarUrl || undefined}
                    sx={{ width: 40, height: 40, bgcolor: "#3A3A3A", fontSize: 15 }}
                  >
                    {(thread.user?.name || "?").charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {thread.user?.name || "Unknown user"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Mail size={12} color="#929292" />
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "12px",
                          color: "#929292",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {thread.user?.email || "no email"}
                      </Typography>
                    </Box>
                  </Box>

                  {selected && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "999px",
                        bgcolor:
                          selected.status === "new" ? "#4A1518" : "#1B3A1F",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "11px",
                          color:
                            selected.status === "new" ? "#E53935" : "#4CAF50",
                        }}
                      >
                        {selected.status === "new" ? "New" : "Replied"}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Messages */}
                <Box
                  sx={{
                    flex: 1,
                    px: 3,
                    py: 3,
                    overflowY: "auto",
                    maxHeight: 460,
                    minHeight: 280,
                    scrollbarWidth: "thin",
                  }}
                >
                  {thread.messages.length === 0 ? (
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#6B6B6B",
                        textAlign: "center",
                        py: 6,
                      }}
                    >
                      No messages yet in this conversation.
                    </Typography>
                  ) : (
                    thread.messages.map((m) => {
                      const isUser = !m.isAgent;
                      return (
                        <Box
                          key={m._id}
                          sx={{
                            display: "flex",
                            justifyContent: isUser ? "flex-start" : "flex-end",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "80%",
                              px: 2,
                              py: 1.4,
                              borderRadius: "12px",
                              bgcolor: isUser ? "#242424" : "#E50914",
                              borderTopLeftRadius: isUser ? 4 : 12,
                              borderTopRightRadius: isUser ? 12 : 4,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 500,
                                fontSize: "14px",
                                lineHeight: 1.6,
                                color: isUser ? "#FFFFFF" : "#FFFFFF",
                                wordBreak: "break-word",
                              }}
                            >
                              {m.text}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontWeight: 400,
                                fontSize: "10px",
                                mt: 0.5,
                                color: isUser ? "#8A8A8A" : "#FFFFFF90",
                              }}
                            >
                              {formatDate(m.createdAt)}
                              {isUser &&
                                m.status === "replied" && (
                                  <Box
                                    component="span"
                                    sx={{ display: "inline-flex", alignItems: "center", ml: 1, verticalAlign: "middle" }}
                                  >
                                    <Check size={11} style={{ verticalAlign: "middle" }} />
                                  </Box>
                                )}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                  <div ref={threadEndRef} />
                </Box>

                {/* Reply composer */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderTop: "1px solid #1F1F1F",
                    bgcolor: "#1A1A1A",
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Type your reply… it will be sent to the user by email."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
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
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                    <Button
                      startIcon={
                        sending ? (
                          <CircularProgress size={15} sx={{ color: "#FFFFFF" }} />
                        ) : (
                          <Send size={15} color="#FFFFFF" strokeWidth={2.2} />
                        )
                      }
                      onClick={handleSend}
                      disabled={sending || !reply.trim()}
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
                        "&:disabled": {
                          bgcolor: "#7A1A1F",
                          color: "#FFFFFF80",
                        },
                      }}
                    >
                      {sending ? "Sending…" : "Send Reply"}
                    </Button>
                  </Box>
                </Box>
              </>
            ) : null}
          </Box>
        ) : (
          <Box
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              py: 8,
            }}
          >
            <User size={24} color="#6B6B6B" />
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                color: "#6B6B6B",
              }}
            >
              Select a conversation to view and reply.
            </Typography>
          </Box>
        )}
      </Box>

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
