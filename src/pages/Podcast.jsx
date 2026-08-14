import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  TextField,
  MenuItem,
  Select,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  Podcast as PodcastIcon,
  Users,
  Clock3,
  Plus,
  PlayCircle,
  ChevronRight,
  MoreHorizontal,
  FilePlay,
  Play,
  PieChart,
  X,
  ChevronDown,
  CalendarClock,
  Video,
  Trash2,
} from "lucide-react";

import { getDashboardStats, getPodcasts, createPodcast, deletePodcast } from "../services/api";
import { PODCAST_HEADERS } from "../data/podcastEpisodes";

const cellSx = {
  fontFamily: "Poppins",
  fontWeight: 500,
  fontSize: "13px",
  color: "#FFFFFF",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

function parsePlays(value) {
  const s = String(value).toLowerCase();
  const num = parseFloat(s);
  if (s.includes("k")) return Math.round(num * 1000);
  if (s.includes("m")) return Math.round(num * 1000000);
  return num || 0;
}

function formatCompact(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function formatWatchTime(sec) {
  const total = Math.floor(Number(sec) || 0);
  if (total <= 0) return "—";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDisplayDate(d) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusPill({ status }) {
  const published = status === "Published";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.4,
        py: 0.5,
        borderRadius: "8px",
        fontFamily: "Poppins",
        fontWeight: 500,
        fontSize: "12px",
        bgcolor: published ? "#22C55E1A" : "#1F1F1F",
        color: published ? "#22C55E" : "#FF8D28",
      }}
    >
      {status}
    </Box>
  );
}

function EpisodeThumb({ size = 38, icon = 18 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "8px",
        bgcolor: "#1F1F1F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <PlayCircle size={icon} color="#E50914" />
    </Box>
  );
}

function TypePill({ type }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.4,
        py: 0.5,
        borderRadius: "8px",
        border: "1px solid #2A2A2A",
        bgcolor: "#1F1F1F",
        fontFamily: "Poppins",
        fontWeight: 500,
        fontSize: "12px",
        color: "#FFFFFF",
        whiteSpace: "nowrap",
        width: "fit-content",
      }}
    >
      {type}
    </Box>
  );
}

export default function Podcast() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newHost, setNewHost] = useState("");
  const [newGuest, setNewGuest] = useState("");
  const [newType, setNewType] = useState("Video");
  const [newDuration, setNewDuration] = useState("");
  const [publishMode, setPublishMode] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [mediaFile, setMediaFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setData(res.data))
      .catch(() => {});
    getPodcasts()
      .then((res) => {
        setEpisodes(res.data.podcasts || []);
        setLoadError("");
      })
      .catch(() => setLoadError("Failed to load podcasts"))
      .finally(() => setLoading(false));
  }, []);

  const totalPlays = episodes.reduce((sum, ep) => sum + parsePlays(ep.plays), 0);
  const totalWatchSec = episodes.reduce(
    (sum, ep) => sum + (Number(ep.watchTimeSec) || 0),
    0
  );
  const avgWatchSec =
    totalPlays > 0 ? Math.round(totalWatchSec / totalPlays) : 0;
  const avgCompletion = episodes.length
    ? Math.round(
        episodes.reduce((sum, ep) => sum + (Number(ep.completion) || 0), 0) /
          episodes.length
      )
    : 0;

  const stats = [
    {
      title: "Total Episodes",
      value: episodes.length,
      icon: FilePlay,
    },
    {
      title: "Total Plays",
      value: formatCompact(totalPlays),
      icon: Play,
    },
    {
      title: "Avg Watch Time",
      value: avgWatchSec > 0 ? formatWatchTime(avgWatchSec) : "—",
      icon: Clock3,
    },
    {
      title: "Avg Completion",
      value: episodes.length ? `${avgCompletion}%` : "—",
      icon: PieChart,
    },
    {
      title: "Subscribers",
      value: data?.activeSubscribers?.toLocaleString() ?? "—",
      icon: Users,
    },
  ];

  const gridColumns = "2.2fr 1.4fr 0.8fr 1fr 0.8fr 1.2fr 0.9fr 0.4fr";

  const openAddModal = () => {
    setNewTitle("");
    setNewHost("");
    setNewGuest("");
    setNewType("Video");
    setNewDuration("");
    setPublishMode("now");
    setScheduleDate("");
    setScheduleTime("09:00");
    setMediaFile(null);
    setFormError("");
    setOpen(true);
  };

  const handleAddEpisode = async () => {
    if (!newTitle.trim()) {
      setFormError("Episode title is required");
      return;
    }
    if (!newHost.trim()) {
      setFormError("Host is required");
      return;
    }
    if (!newDuration.trim()) {
      setFormError("Duration is required");
      return;
    }
    if (publishMode === "schedule" && !scheduleDate) {
      setFormError("Please pick a schedule date");
      return;
    }
    if (!mediaFile) {
      setFormError("Please upload a video or audio file");
      return;
    }

    const scheduled = publishMode === "schedule";
    const formData = new FormData();
    formData.append("title", newTitle.trim());
    formData.append("host", newHost.trim());
    formData.append("guest", newGuest.trim());
    formData.append("type", newType);
    formData.append("duration", newDuration.trim());
    formData.append("status", scheduled ? "Scheduled" : "Published");
    formData.append("media", mediaFile);
    if (scheduled) {
      formData.append(
        "scheduleDate",
        new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      );
    }

    setSubmitting(true);
    setFormError("");
    try {
      const res = await createPodcast(formData);
      setEpisodes((prev) => [res.data.podcast, ...prev]);
      setOpen(false);
      setUploadSuccess("Episode uploaded successfully");
      setTimeout(() => setUploadSuccess(""), 4000);
    } catch (err) {
      setFormError(
        err.response?.data?.error || "Failed to add episode. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEpisode = () => {
    if (!deleteConfirm) return;
    deletePodcast(deleteConfirm._id)
      .then(() => {
        setEpisodes((prev) => prev.filter((ep) => ep._id !== deleteConfirm._id));
        setDeleteConfirm(null);
      })
      .catch(() => {
        setDeleteConfirm(null);
      });
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
        <PodcastIcon size={20} color="#929292" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Podcasts
        </Typography>
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "20px", md: "24px" },
              color: "#FFFFFF",
              mb: 1,
            }}
          >
            Podcasts
          </Typography>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "13px",
              color: "#6B6B6B",
            }}
          >
            Episodes, plays, completion and scheduling.
          </Typography>
        </Box>

        <Button
          startIcon={<Plus size={18} color="#FFFFFF" />}
          onClick={openAddModal}
          sx={{
            bgcolor: "#E50914",
            color: "#FFFFFF",
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "14px",
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
            py: 1.3,
            width: { xs: "100%", sm: "auto" },
            boxShadow: "0px 4px 20px #F81B1B40",
            "&:hover": {
              bgcolor: "#E50914",
              boxShadow: "0px 4px 20px #F81B1B40",
            },
          }}
        >
          Add Episode
        </Button>
      </Box>

      {uploadSuccess && (
        <Box
          sx={{
            mb: 3,
            bgcolor: "#0F2A1A",
            border: "1px solid #22C55E",
            borderRadius: "10px",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "13px",
              color: "#22C55E",
            }}
          >
            {uploadSuccess}
          </Typography>
        </Box>
      )}

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
                <Icon size={28} color="#2A2A2A" />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* All Episodes */}
      <Box
        sx={{
          mt: 4,
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "10px",
          boxShadow: "0px 4px 20px #00000066",
          p: { xs: 2, md: 3 },
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
          All Episodes
        </Typography>

        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#929292",
              }}
            >
              Loading episodes...
            </Typography>
          </Box>
        )}

        {!loading && loadError && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 8,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#FF6B6B",
              }}
            >
              {loadError}
            </Typography>
            <Button
              onClick={() => {
                setLoading(true);
                getPodcasts()
                  .then((res) => {
                    setEpisodes(res.data.podcasts || []);
                    setLoadError("");
                  })
                  .catch(() => setLoadError("Failed to load podcasts"))
                  .finally(() => setLoading(false));
              }}
              sx={{
                bgcolor: "#1F1F1F",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                py: 1,
                "&:hover": { bgcolor: "#2A2A2A" },
              }}
            >
              Retry
            </Button>
          </Box>
        )}

        {!loading && !loadError && (
        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            overflowX: "auto",
            borderRadius: "10px",
            border: "1px solid #161616",
          }}
        >
          <Box sx={{ minWidth: 980 }}>
            {/* Header row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: gridColumns,
                alignItems: "center",
                bgcolor: "#1F1F1F",
                border: "1px solid #161616",
                px: 2,
                py: 1.4,
                gap: 1,
              }}
            >
              {PODCAST_HEADERS.map((h) => (
                <Typography
                  key={h}
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#929292",
                  }}
                >
                  {h}
                </Typography>
              ))}
            </Box>

            {/* Rows */}
            {episodes.map((ep) => (
              <Box
                key={ep._id}
                onClick={() => navigate(`/podcast/${ep._id}`)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: gridColumns,
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  gap: 1,
                  borderBottom: "1px solid #1F1F1F",
                  cursor: "pointer",
                  transition: "background .15s",
                  "&:last-of-type": { borderBottom: "none" },
                  "&:hover": { bgcolor: "#1A1A1A" },
                }}
              >
                {/* Episode */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                  <EpisodeThumb />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {ep.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "11px",
                        color: "#929292",
                      }}
                    >
                      {ep.duration}
                    </Typography>
                  </Box>
                </Box>

                <Typography sx={cellSx}>{ep.host}</Typography>
                <TypePill type={ep.type} />
                <Typography sx={cellSx}>{ep.date}</Typography>
                <Typography sx={cellSx}>{ep.plays}</Typography>

                {/* Completion */}
                <Box sx={{ pr: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={ep.completion}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 6,
                        bgcolor: "#1A1A1A",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: "#22C55E",
                          borderRadius: 6,
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "11px",
                        color: "#929292",
                        minWidth: 30,
                        textAlign: "right",
                      }}
                    >
                      {ep.completion}%
                    </Typography>
                  </Box>
                </Box>

                {/* Status */}
                <Box>
                  <StatusPill status={ep.status} />
                </Box>

                {/* Action */}
                <Box
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(ep); }}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "#1F1F1F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background .15s",
                    "&:hover": { bgcolor: "#2A0F12" },
                  }}
                >
                  <Trash2 size={16} color="#E50914" />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        )}

        {/* Mobile episode cards */}
        {!loading && !loadError && (
        <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 2 }}>
          {episodes.map((ep) => (
            <Box
              key={ep._id}
              onClick={() => navigate(`/podcast/${ep._id}`)}
              sx={{
                bgcolor: "#1A1A1A",
                border: "1px solid #1F1F1F",
                borderRadius: "10px",
                p: 2,
                cursor: "pointer",
                transition: "background .15s",
                "&:active": { bgcolor: "#222222" },
              }}
            >
              {/* Episode header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <EpisodeThumb />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "#FFFFFF",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {ep.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "11px",
                      color: "#929292",
                    }}
                  >
                    {ep.duration}
                  </Typography>
                </Box>
                <Box
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(ep); }}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: "#1F1F1F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "#2A0F12" },
                  }}
                >
                  <Trash2 size={16} color="#E50914" />
                </Box>
              </Box>

              {/* Meta */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                {[
                  ["Host", ep.host],
                  ["Type", ep.type],
                  ["Date", ep.date],
                  ["Plays", ep.plays],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "10px",
                        color: "#6B6B6B",
                        mb: 0.5,
                      }}
                    >
                      {label}
                    </Typography>
                    {label === "Type" ? (
                      <TypePill type={value} />
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "12px",
                          color: "#FFFFFF",
                        }}
                      >
                        {value}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Completion */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={ep.completion}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 6,
                    bgcolor: "#1F1F1F",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#22C55E",
                      borderRadius: 6,
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "11px",
                    color: "#929292",
                  }}
                >
                  {ep.completion}%
                </Typography>
              </Box>

              {/* Status */}
              <StatusPill status={ep.status} />
            </Box>
          ))}
        </Box>
        )}
      </Box>

      {/* Delete Episode Confirmation */}
      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#0B0B0B",
            border: "1px solid #2A2A2A",
            borderRadius: "16px",
            boxShadow: "0px 4px 20px #00000066",
            m: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontFamily: "Inter", fontWeight: 600, fontSize: "20px", color: "#FFFFFF" }}>
              Delete Episode
            </Typography>
            <IconButton onClick={() => setDeleteConfirm(null)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>
          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#929292", mb: 3 }}>
            Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              onClick={() => setDeleteConfirm(null)}
              sx={{
                bgcolor: "#1F1F1F",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                py: 1.3,
                "&:hover": { bgcolor: "#1F1F1F" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteEpisode}
              sx={{
                bgcolor: "#E50914",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                py: 1.3,
                boxShadow: "0px 4px 20px #F81B1B40",
                "&:hover": { bgcolor: "#E50914" },
              }}
            >
              Delete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#0B0B0B",
            border: "1px solid #2A2A2A",
            borderRadius: "16px",
            boxShadow: "0px 4px 20px #00000066",
            m: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{ fontFamily: "Inter", fontWeight: 600, fontSize: "20px", color: "#FFFFFF" }}
            >
              Add Episode
            </Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />

          {/* Title */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Episode Title
          </Typography>
          <TextField
            placeholder="E.g Episode 46 – Finishing at the Rim"
            variant="outlined"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#121212",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                "& fieldset": { borderColor: "#1A1A1A" },
                "&:hover fieldset": { borderColor: "#1A1A1A" },
                "&.Mui-focused fieldset": { borderColor: "#1A1A1A" },
              },
              "& input::placeholder": {
                color: "#5A5A5A",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                opacity: 1,
              },
            }}
          />

          {/* Host + Type */}
          <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Host
              </Typography>
              <TextField
                placeholder="E.g Coach Adams"
                variant="outlined"
                fullWidth
                value={newHost}
                onChange={(e) => setNewHost(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#121212",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    "& fieldset": { borderColor: "#1A1A1A" },
                    "&:hover fieldset": { borderColor: "#1A1A1A" },
                    "&.Mui-focused fieldset": { borderColor: "#1A1A1A" },
                  },
                  "& input::placeholder": {
                    color: "#5A5A5A",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "14px",
                    opacity: 1,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Type
              </Typography>
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                fullWidth
                MenuProps={{
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
                }}
                sx={{
                  bgcolor: "#121212",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
                  "& .MuiSelect-select": { py: 1.5 },
                }}
                IconComponent={(props) => <ChevronDown {...props} size={18} color="#929292" />}
              >
                <MenuItem value="Video">Video</MenuItem>
                <MenuItem value="Audio">Audio</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Guest */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Guest (optional)
          </Typography>
          <TextField
            placeholder="E.g a pro athlete appearing on the show"
            variant="outlined"
            fullWidth
            value={newGuest}
            onChange={(e) => setNewGuest(e.target.value)}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#121212",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                "& fieldset": { borderColor: "#1A1A1A" },
                "&:hover fieldset": { borderColor: "#1A1A1A" },
                "&.Mui-focused fieldset": { borderColor: "#1A1A1A" },
              },
              "& input::placeholder": {
                color: "#5A5A5A",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                opacity: 1,
              },
            }}
          />

          {/* Duration */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Duration
          </Typography>
          <TextField
            placeholder="E.g 22 min"
            variant="outlined"
            fullWidth
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#121212",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                "& fieldset": { borderColor: "#1A1A1A" },
                "&:hover fieldset": { borderColor: "#1A1A1A" },
                "&.Mui-focused fieldset": { borderColor: "#1A1A1A" },
              },
              "& input::placeholder": {
                color: "#5A5A5A",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                opacity: 1,
              },
            }}
          />

          {/* Video / Audio upload */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Video / Audio File
          </Typography>
          <Box
            onClick={() => document.getElementById("episode-media-input").click()}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              border: "1px dashed #2A2A2A",
              borderRadius: "10px",
              bgcolor: "#121212",
              py: 2,
              mb: 2.5,
              cursor: "pointer",
              "&:hover": { borderColor: "#3A3A3A", bgcolor: "#161616" },
            }}
          >
            <Video size={18} color="#929292" />
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "13px",
                color: "#A0A0A0",
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {mediaFile ? mediaFile.name : "Click to upload video or audio"}
            </Typography>
            {mediaFile && (
              <Box
                component="span"
                onClick={(e) => {
                  e.stopPropagation();
                  setMediaFile(null);
                }}
                sx={{ display: "flex", alignItems: "center", color: "#929292", ml: 0.5 }}
              >
                <X size={16} />
              </Box>
            )}
            <input
              id="episode-media-input"
              type="file"
              accept="video/*,audio/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setMediaFile(file);
                if (file) {
                  setNewType(file.type.startsWith("video") ? "Video" : "Audio");
                }
              }}
            />
          </Box>

          {/* Publish */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Publish
          </Typography>
          <Select
            value={publishMode}
            onChange={(e) => setPublishMode(e.target.value)}
            fullWidth
            MenuProps={{
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
            }}
            sx={{
              bgcolor: "#121212",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              mb: 2.5,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
              "& .MuiSelect-select": { py: 1.5 },
            }}
            IconComponent={(props) => <ChevronDown {...props} size={18} color="#929292" />}
          >
            <MenuItem value="now">Publish now</MenuItem>
            <MenuItem value="schedule">Schedule for later</MenuItem>
          </Select>

          {/* Schedule fields */}
          {publishMode === "schedule" && (
            <>
              <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexDirection: { xs: "column", sm: "row" } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                    Date
                  </Typography>
                  <TextField
                    type="date"
                    variant="outlined"
                    fullWidth
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    inputProps={{ style: { colorScheme: "dark" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#121212",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "14px",
                        "& fieldset": { borderColor: "#1A1A1A" },
                        "&:hover fieldset": { borderColor: "#1A1A1A" },
                        "&.Mui-focused fieldset": { borderColor: "#1A1A1A" },
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                    Time
                  </Typography>
                  <TextField
                    type="time"
                    variant="outlined"
                    fullWidth
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    inputProps={{ style: { colorScheme: "dark" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#121212",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "14px",
                        "& fieldset": { borderColor: "#1A1A1A" },
                        "&:hover fieldset": { borderColor: "#1A1A1A" },
                        "&.Mui-focused fieldset": { borderColor: "#1A1A1A" },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2.5,
                  bgcolor: "#121212",
                  border: "1px dashed #2A2A2A",
                  borderRadius: "10px",
                  px: 2,
                  py: 1.5,
                }}
              >
                <CalendarClock size={18} color="#FF8D28" />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#A0A0A0",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {scheduleDate
                    ? `Scheduled for ${formatDisplayDate(scheduleDate)} at ${scheduleTime}`
                    : "Pick a date to schedule this episode"}
                </Typography>
              </Box>
            </>
          )}

          {/* Error */}
          {formError && (
            <Box
              sx={{
                bgcolor: "#2A0F12",
                border: "1px solid #E50914",
                borderRadius: "10px",
                px: 2,
                py: 1.5,
                mb: 2.5,
              }}
            >
              <Typography
                sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#FF6B6B" }}
              >
                {formError}
              </Typography>
            </Box>
          )}

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Button
              onClick={() => setOpen(false)}
              sx={{
                bgcolor: "#1F1F1F",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                py: 1.3,
                width: { xs: "100%", sm: "auto" },
                "&:hover": { bgcolor: "#1F1F1F" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEpisode}
              disabled={submitting}
              sx={{
                bgcolor: "#E50914",
                color: "#FFFFFF",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                borderRadius: "10px",
                px: 3,
                py: 1.3,
                width: { xs: "100%", sm: "auto" },
                boxShadow: "0px 4px 20px #F81B1B40",
                "&:hover": { bgcolor: "#E50914" },
                "&.Mui-disabled": {
                  bgcolor: "#E50914",
                  color: "#FFFFFF",
                  opacity: 0.6,
                },
              }}
            >
              {submitting ? "Adding..." : "Add Episode"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
