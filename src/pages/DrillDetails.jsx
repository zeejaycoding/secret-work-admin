import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, LinearProgress, CircularProgress, Dialog, DialogContent, IconButton, TextField, Select, MenuItem } from "@mui/material";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ChevronRight,
  X,
  ImagePlus,
  Video,
} from "lucide-react";
import { getDrill, updateDrill, updateDrillFiles, deleteDrill, getPros } from "../services/api";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function formatViews(n) {
  if (!n) return "0 views";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k views";
  return n + " views";
}

const STATUS_META = {
  published: { label: "Published", color: "#22C55E", bg: "#132018" },
  draft: { label: "Draft", color: "#F59E0B", bg: "#1F1A10" },
  archived: { label: "Archived", color: "#929292", bg: "#1F1F1F" },
};

export default function DrillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [drill, setDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    completionRate: "",
    avgWatchTime: "",
    likes: "",
    proId: "",
  });
  const [pros, setPros] = useState([]);
  const [editThumb, setEditThumb] = useState(null);
  const [editVideo, setEditVideo] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    getDrill(id)
      .then((res) => setDrill(res.data.drill))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getPros()
      .then((res) => setPros(res.data.pros || []))
      .catch(() => {});
  }, []);

  const openEdit = () => {
    setEditForm({
      title: drill?.title || "",
      description: drill?.description || "",
      completionRate: drill?.completionRate ?? "",
      avgWatchTime: drill?.avgWatchTime || "",
      likes: drill?.likes ?? "",
      proId: drill?.proId?._id || drill?.proId || "",
    });
    setEditThumb(null);
    setEditVideo(null);
    setEditError("");
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (saving || !id) return;
    if (!editForm.title.trim()) {
      setEditError("Drill title is required.");
      return;
    }
    setSaving(true);
    setEditError("");

    const hasFiles = editThumb || editVideo;
    const base = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      completionRate: Number(editForm.completionRate) || 0,
      avgWatchTime: editForm.avgWatchTime.trim(),
      likes: Number(editForm.likes) || 0,
      proId: editForm.proId || "",
    };

    const finish = (res) => {
      setDrill(res.data.drill);
      setEditOpen(false);
      setSaving(false);
    };
    const fail = (err) => {
      setEditError(err.response?.data?.error || "Failed to save changes. Please try again.");
      setSaving(false);
    };

    if (hasFiles) {
      const form = new FormData();
      Object.keys(base).forEach((k) => form.append(k, base[k]));
      if (editThumb) form.append("thumbnail", editThumb);
      if (editVideo) form.append("video", editVideo);
      updateDrillFiles(id, form).then(finish).catch(fail);
    } else {
      updateDrill(id, base).then(finish).catch(fail);
    }
  };

  const handleDelete = () => {
    if (deleting || !id) return;
    setDeleting(true);
    deleteDrill(id)
      .then(() => navigate("/content"))
      .catch(() => setDeleting(false))
      .finally(() => setConfirmOpen(false));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#E50914" }} />
      </Box>
    );
  }

  if (notFound || !drill) {
    return (
      <Box>
        <Box
          onClick={() => navigate("/content")}
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
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "13px", color: "#FFFFFF" }}>
            Back
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "18px", color: "#FFFFFF" }}>
          Drill not found
        </Typography>
      </Box>
    );
  }

  const statusMeta = STATUS_META[drill.status] || STATUS_META.draft;
  const publishedDate = drill.createdAt
    ? new Date(drill.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

  const stats = [
    [drill.completionRate ? `${drill.completionRate}%` : "—", "Completion"],
    [drill.avgWatchTime || "—", "Avg Watch"],
    [(drill.likes || 0).toLocaleString(), "Likes"],
    [publishedDate, "Date Published"],
  ];

  const formatDay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(
      String(dateStr).includes("T") ? dateStr : String(dateStr) + "T00:00:00"
    );
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartData =
    drill.viewsHistory && drill.viewsHistory.length
      ? drill.viewsHistory.map((v) => ({
          day: formatDay(v.date),
          views: v.count || 0,
        }))
      : Array.from({ length: 14 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (13 - i));
          return { day: formatDay(d), views: 0 };
        });

  return (
    <Box>
      {/* Back */}
      <Box
        onClick={() => navigate("/content")}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          width: "fit-content",
          mb: { xs: 2, md: 4 },
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

      {/* Drill Label */}
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#929292",
          mb: 1,
        }}
      >
        Drill
      </Typography>

      {/* Title */}
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: { xs: "18px", sm: "20px", md: "24px" },
          color: "#FFFFFF",
          mb: 1,
        }}
      >
        {drill.title}
      </Typography>

      {/* Coach */}
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#929292",
          mb: 3,
        }}
      >
        {drill.coach} • {drill.category} • {drill.duration}
      </Typography>

      {drill.proId?.name && (
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "12px",
            color: "#E50914",
            mb: 3,
          }}
        >
          Linked athlete: {drill.proId.name}
        </Typography>
      )}

      {/* Status + Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Status */}
          <Box
            sx={{
              bgcolor: statusMeta.bg,
              px: 2,
              py: 0.8,
              borderRadius: "8px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: statusMeta.color,
              }}
            >
              {statusMeta.label}
            </Typography>
          </Box>

          {/* Views */}
          <Box
            sx={{
              bgcolor: "#1F1F1F",
              px: 2,
              py: 0.8,
              borderRadius: "8px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#FFFFFF",
              }}
            >
              {formatViews(drill.views)}
            </Typography>
          </Box>
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Button
            startIcon={<Edit size={16} color="#FFFFFF" />}
            onClick={openEdit}
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

              "&:hover": {
                bgcolor: "#1F1F1F",
                borderColor: "#3A3A3A",
              },
            }}
          >
            Edit
          </Button>

          <Button
            startIcon={<Trash2 size={16} color="#FFFFFF" />}
            onClick={() => setConfirmOpen(true)}
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

              "&:hover": {
                bgcolor: "#1F1F1F",
                borderColor: "#3A3A3A",
              },
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      <Box
  sx={{
    mt: { xs: 3, md: 4 },
    display: "grid",
    gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 7fr) minmax(0, 3fr)" },
    gap: { xs: 2, md: 3 },
  }}
>
  {/* LEFT */}
  <Box
    sx={{
      bgcolor: "#161616",
      border: "1px solid #1F1F1F",
      borderRadius: "12px",
      boxShadow: "0px 4px 20px #00000066",
      overflow: "hidden",
    }}
  >
      {drill.videoUrl ? (
        <Box
          component="video"
          src={drill.videoUrl}
          controls
          poster={drill.imageUrl || undefined}
          sx={{
            width: "100%",
            maxHeight: { xs: 240, sm: 340, md: 420 },
            bgcolor: "#000",
            display: "block",
          }}
        />
      ) : drill.imageUrl ? (
        <Box
          component="img"
          src={drill.imageUrl}
          sx={{
            width: "100%",
            height: { xs: 200, sm: 280, md: 340 },
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: { xs: 200, sm: 280, md: 340 },
            bgcolor: "#2A2A2A",
          }}
        />
      )}

    <Box sx={{ p: 3 }}>
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 600,
          fontSize: "16px",
          color: "#FFFFFF",
          mb: 1.5,
        }}
      >
        About this Drill
      </Typography>

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "12px",
          color: "#929292",
          lineHeight: 1.8,
          mb: 3,
        }}
      >
        {drill.description || "No description provided."}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2,1fr)", md: "repeat(4,1fr)" },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {stats.map(([value, label]) => (
          <Box
            key={label}
            sx={{
              bgcolor: "#1F1F1F",
              borderRadius: "10px",
              p: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "15px",
                color: "#FFFFFF",
                mb: .5,
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "11px",
                color: "#929292",
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>

  {/* RIGHT */}
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 3,
    }}
  >
    {/* Coach */}
    <Box
      onClick={() => navigate(`/coach/${encodeURIComponent(drill.coach || "")}`)}
      sx={{
        bgcolor: "#161616",
        border: "1px solid #1F1F1F",
        borderRadius: "12px",
        boxShadow: "0px 4px 20px #00000066",
        p: 2.5,
        cursor: "pointer",
        transition: ".25s",
        "&:hover": {
          borderColor: "#3A3A3A",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "#E50914",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "18px",
                color: "#FFFFFF",
              }}
            >
              {(drill.coach || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "CO"}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "16px",
                color: "#FFFFFF",
                mb: .5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {drill.coach}
            </Typography>

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "12px",
                color: "#929292",
              }}
            >
              {drill.category}
            </Typography>
          </Box>
        </Box>

        <ChevronRight
          size={20}
          color="#929292"
          style={{ cursor: "pointer" }}
        />
      </Box>
    </Box>

    {/* Completion */}
    <Box
      sx={{
        bgcolor: "#161616",
        border: "1px solid #1F1F1F",
        borderRadius: "12px",
        boxShadow: "0px 4px 20px #00000066",
        p: 2.5,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "14px",
          color: "#FFFFFF",
          mb: 2,
        }}
      >
        Completion Rate
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "14px",
            color: "#FFFFFF",
          }}
        >
          {drill.completionRate ? `${drill.completionRate}% Complete` : "No data"}
        </Typography>

        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "14px",
            color: "#929292",
          }}
        >
          Target 75%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.min(Math.max(drill.completionRate || 0, 0), 100)}
        sx={{
          height: 10,
          borderRadius: 10,
          backgroundColor: "#1A1A1A",

          "& .MuiLinearProgress-bar": {
            backgroundColor: "#22C55E",
            borderRadius: 10,
          },
        }}
      />
    </Box>
  </Box>
  <Box
  sx={{
    mt: 3,
    minWidth: 0,
    bgcolor: "#161616",
    border: "1px solid #1F1F1F",
    borderRadius: "12px",
    boxShadow: "0px 4px 20px #00000066",
    p: 3,
  }}
>
  <Typography
    sx={{
      fontFamily: "Poppins",
      fontWeight: 500,
      fontSize: "18px",
      color: "#FFFFFF",
      mb: 3,
    }}
  >
    14 Days Views
  </Typography>

  <Box
    sx={{
      width: "100%",
      height: { xs: 220, sm: 280, md: 340 },
      overflowX: "auto",
      overflowY: "hidden",
    }}
  >
    <Box sx={{ minWidth: 840, width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
        >
        <defs>
          <linearGradient
            id="viewsGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#FF2222"
              stopOpacity={0.7}
            />
            <stop
              offset="100%"
              stopColor="#FF2222"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          vertical={false}
          stroke="#2A2A2A"
          strokeDasharray="0"
        />

        <XAxis
          dataKey="day"
          interval={0}
          tickMargin={10}
          padding={{ left: 16, right: 36 }}
          tick={{
            fill: "#929292",
            fontSize: 12,
            fontFamily: "Poppins",
          }}
          axisLine={{ stroke: "#2A2A2A" }}
          tickLine={false}
        />

        <YAxis
          tick={{
            fill: "#929292",
            fontSize: 12,
            fontFamily: "Poppins",
          }}
          axisLine={false}
          tickLine={false}
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
          formatter={(v) => [formatViews(v)]}
        />

        <Area
          type="monotone"
          dataKey="views"
          stroke="#E50914"
          strokeWidth={3}
          fill="url(#viewsGradient)"
        />
      </AreaChart>
      </ResponsiveContainer>
    </Box>
  </Box>
</Box>
</Box>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
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
            <Typography sx={{ fontFamily: "Inter", fontWeight: 600, fontSize: "18px", color: "#FFFFFF" }}>
              Delete Drill
            </Typography>
            <IconButton onClick={() => setConfirmOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#A0A0A0", mb: 3 }}>
            Are you sure you want to delete "{drill.title}"? This cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              onClick={() => setConfirmOpen(false)}
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
              onClick={handleDelete}
              disabled={deleting}
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
                "&.Mui-disabled": { bgcolor: "#E50914", color: "#FFFFFF", opacity: 0.6 },
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography sx={{ fontFamily: "Inter", fontWeight: 600, fontSize: "18px", color: "#FFFFFF" }}>
              Edit Drill
            </Typography>
            <IconButton onClick={() => setEditOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Drill Title
          </Typography>
          <TextField
            placeholder="E.g Killer Crossover"
            variant="outlined"
            fullWidth
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
            }}
          />

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Drill Description
          </Typography>
          <TextField
            placeholder="Describe the drill..."
            variant="outlined"
            fullWidth
            multiline
            minRows={3}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
            }}
          />

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Pro Athlete (drills shown on their Learn page)
          </Typography>
          <Select
            value={editForm.proId}
            onChange={(e) => setEditForm({ ...editForm, proId: e.target.value })}
            fullWidth
            displayEmpty
            renderValue={(v) =>
              v
                ? (pros.find((p) => p._id === v) || {}).name || v
                : "None"
            }
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
          >
            <MenuItem value="">None</MenuItem>
            {pros.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Completion Rate (%)
              </Typography>
              <TextField
                type="number"
                variant="outlined"
                fullWidth
                value={editForm.completionRate}
                onChange={(e) => setEditForm({ ...editForm, completionRate: e.target.value })}
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
                Avg Watch Time
              </Typography>
              <TextField
                placeholder="E.g 6m 12s"
                variant="outlined"
                fullWidth
                value={editForm.avgWatchTime}
                onChange={(e) => setEditForm({ ...editForm, avgWatchTime: e.target.value })}
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
                Likes
              </Typography>
              <TextField
                type="number"
                variant="outlined"
                fullWidth
                value={editForm.likes}
                onChange={(e) => setEditForm({ ...editForm, likes: e.target.value })}
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

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Thumbnail {drill.imageUrl ? "(current uploaded image — pick a new one to replace it)" : ""}
          </Typography>
          <Box
            onClick={() => document.getElementById("edit-thumb-input").click()}
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
            <ImagePlus size={18} color="#929292" />
            <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#A0A0A0" }}>
              {editThumb ? editThumb.name : "Click to upload new thumbnail"}
            </Typography>
            <input
              id="edit-thumb-input"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setEditThumb(e.target.files?.[0] || null)}
            />
          </Box>

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Drill Video {drill.videoUrl ? "(current uploaded video — pick a new one to replace it)" : ""}
          </Typography>
          <Box
            onClick={() => document.getElementById("edit-video-input").click()}
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
            <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#A0A0A0" }}>
              {editVideo ? editVideo.name : "Click to upload new drill video"}
            </Typography>
            <input
              id="edit-video-input"
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => setEditVideo(e.target.files?.[0] || null)}
            />
          </Box>

          {editError && (
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
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#FF6B6B" }}>
                {editError}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              onClick={() => setEditOpen(false)}
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
              onClick={handleSaveEdit}
              disabled={saving}
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
                "&.Mui-disabled": { bgcolor: "#E50914", color: "#FFFFFF", opacity: 0.6 },
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
