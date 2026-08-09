import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";

import {
  Files,
  Upload,
  Search,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,Eye,
  X,
  ImagePlus,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDrills, createDrill } from "../services/api";

function formatViews(n) {
  if (!n) return "0 views";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k views";
  return n + " views";
}

const MAX_THUMB_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

function compressImage(file, maxDim = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(
              new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
                type: "image/jpeg",
              })
            );
          } else {
            reject(new Error("Could not compress the thumbnail image"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Selected thumbnail file is not a valid image"));
    };
    img.src = url;
  });
}
export default function ContentLibrary() {
  const navigate = useNavigate();
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Dribbling");
  const [newLevel, setNewLevel] = useState("Beginner");
  const [newDuration, setNewDuration] = useState("10 min");
  const [newEquipment, setNewEquipment] = useState("Dumbell");
  const [newCoach, setNewCoach] = useState("");
  const [thumbFile, setThumbFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleCreateDrill = async () => {
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    setUploadError("");
    try {
      let thumb = thumbFile;
      if (thumb && thumb.size > MAX_THUMB_BYTES) {
        setUploadError("Compressing large thumbnail…");
        try {
          thumb = await compressImage(thumb);
        } catch {
          setUploadError("Could not compress the thumbnail. Please use a smaller image.");
          return;
        }
        if (thumb.size > MAX_THUMB_BYTES) {
          setUploadError(
            "Thumbnail is too large (max 10 MB) even after compressing. Please use a smaller image."
          );
          return;
        }
      }
      if (videoFile && videoFile.size > MAX_VIDEO_BYTES) {
        setUploadError("Video is too large (max 100 MB). Please use a smaller video.");
        return;
      }
      setUploadError("");
      const form = new FormData();
      form.append("title", newTitle.trim());
      form.append("description", newDesc.trim());
      form.append("coach", newCoach.trim());
      form.append("category", newCategory);
      form.append("level", newLevel);
      form.append("duration", newDuration);
      form.append("equipment", newEquipment);
      form.append("status", "published");
      if (thumb) form.append("thumbnail", thumb);
      if (videoFile) form.append("video", videoFile);
      await createDrill(form);
      setNewTitle("");
      setNewDesc("");
      setNewCategory("Dribbling");
      setNewLevel("Beginner");
      setNewDuration("10 min");
      setNewEquipment("Dumbell");
      setNewCoach("");
      setThumbFile(null);
      setVideoFile(null);
      setUploadModalOpen(false);
      fetchDrills(search, category, status);
    } catch (err) {
      const backendMsg = err.response?.data?.error;
      let msg = backendMsg || err.message || "Failed to upload drill. Please try again.";

      if (err.code === "ECONNABORTED") {
        msg = "Upload timed out. The server may be waking up — please try again.";
      } else if (!err.response) {
        msg = "Network error — could not reach the server. Check your connection and try again.";
      } else if (err.response?.status === 500) {
        msg = backendMsg || "Server error while uploading (check video size limit).";
      }
      console.error("Upload drill failed:", err);
      setUploadError(msg);
    } finally {
      setCreating(false);
    }
  };

  const fetchDrills = (q, cat, st) => {
    const params = {};
    if (q) params.search = q;
    if (cat && cat !== "all") params.category = cat;
    if (st && st !== "all") params.status = st;
    setLoading(true);
    getDrills(params)
      .then((res) => {
        const list = res.data.drills || [];
        const seen = new Set();
        const uniqueDrills = [];
        list.forEach((d) => {
          const key = d._id || `${d.title}-${d.coach}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueDrills.push(d);
          }
        });
        setDrills(uniqueDrills.map((d) => ({
          id: d._id,
          title: d.title,
          coach: d.coach,
          category: d.category,
          views: formatViews(d.views),
          image: d.imageUrl || "",
          videoUrl: d.videoUrl || "",
        })));
      })
      .catch(() => {
        setDrills([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrills(search, category, status); }, []);
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 4,
        }}
      >
        <Files size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Content Library
        </Typography>
      </Box>

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
        fontSize: "24px",
        color: "#FFFFFF",
        mb: 1,
      }}
    >
      Content Library
    </Typography>

    <Typography
      sx={{
        fontFamily: "Poppins",
        fontWeight: 500,
        fontSize: "13px",
        color: "#6B6B6B",
      }}
    >
      All training drills and videos. Upload, edit, preview, assign coaches and
      control visibility.
    </Typography>
  </Box>

  <Button
  startIcon={<Upload size={18} color="#FFFFFF" />}
  onClick={() => { setUploadError(""); setUploadModalOpen(true); }}
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

      "&:hover": {
        bgcolor: "#E50914",
        boxShadow: "0px 4px 20px #F81B1B40",
      },
    }}
  >
    Upload Drill
  </Button>
</Box>

<Box
  sx={{
    bgcolor: "#161616",
    border: "1px solid #1F1F1F",
    borderRadius: "10px",
    boxShadow: "0px 4px 20px #00000066",
    px: 2,
    py: 2,
  }}
>
  <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexWrap: { xs: "wrap", md: "nowrap" },
  }}
>
    {/* Search */}
<Box sx={{ flex: 1 }}>
  <TextField

  placeholder="Search"
  variant="outlined"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onKeyDown={(e) => { if (e.key === "Enter") fetchDrills(search, category, status); }}
  InputProps={{
    startAdornment: (
      <Search
        size={18}
        color="#FFFF"
        style={{ marginRight: 10 }}
      />
    ),
  }}
 sx={{
      width: "100%",
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

    {/* Category */}

    <Select
      value={category}
      onChange={(e) => { setCategory(e.target.value); fetchDrills(search, e.target.value, status); }}
      IconComponent={(props) => (
  <ChevronDown
    {...props}
    size={18}
    color="#929292"
  />
)}
      sx={{
  minWidth: 180,
  height: 44,
  bgcolor: "#1F1F1F",
  borderRadius: "10px",
  color: "#fff",
  

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2A2A2A",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    gap: 1,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: "14px",
    py: 1,
  },
}}
      renderValue={(value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Filter size={16} color="#FFFF" />
          {value === "all" ? "All Categories" : value}
        </Box>
      )}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: "#0B0B0B",
            border: "1px solid #2A2A2A",
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
    >
      <MenuItem value="all">All Categories</MenuItem>
      <MenuItem value="Dribbling">Dribbling</MenuItem>
      <MenuItem value="Shooting">Shooting</MenuItem>
      <MenuItem value="Defence">Defence</MenuItem>
      <MenuItem value="Passing">Passing</MenuItem>
      <MenuItem value="Fitness">Fitness</MenuItem>
    </Select>

    {/* Status */}

    <Select
      value={status}
      onChange={(e) => { setStatus(e.target.value); fetchDrills(search, category, e.target.value); }}
      IconComponent={(props) => (
  <ChevronDown
    {...props}
    size={18}
    color="#929292"
  />
)}
      sx={{
        minWidth: 170,
        bgcolor: "#1F1F1F",
        borderRadius: "10px",
        color: "#fff",
        height: 44,

        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#2A2A2A",
        },

        "& .MuiSvgIcon-root": {
          color: "#929292",
        },

        "& .MuiSelect-select": {
  py: 1,
  fontFamily: "Inter",
  fontWeight: 500,
  fontSize: "14px",
},
      }}
      renderValue={(value) =>
        value === "all"
          ? "All Statuses"
          : value === "published"
          ? "Published"
          : value === "draft"
          ? "Draft"
          : "Archived"
      }
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: "#0B0B0B",
            border: "1px solid #2A2A2A",
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
    >
      <MenuItem value="all">All Statuses</MenuItem>
      <MenuItem value="published">Published</MenuItem>
      <MenuItem value="draft">Draft</MenuItem>
      <MenuItem value="archived">Archived</MenuItem>
    </Select>

    {/* View Toggle */}

    <Box
  sx={{
    display: "flex",
    alignItems: "center",
    bgcolor: "#1F1F1F",
    border: "1px solid #2A2A2A",
    borderRadius: "10px",
    overflow: "hidden",
    height: 44,
  }}
>
  {/* Grid View */}
  <Box
    sx={{
      width: 44,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#2A2A2A", // active
      cursor: "pointer",
    }}
  >
    <LayoutGrid
      size={18}
      color="#FFFFFF"
    />
  </Box>

  {/* List View */}
  <Box
    sx={{
      width: 44,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
  >
    <List
      size={18}
      color="#929292"
    />
  </Box>
</Box>
  </Box>
</Box>
{loading ? (
  <Box
    sx={{
      mt: 6,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      py: 8,
    }}
  >
    <CircularProgress sx={{ color: "#E50914" }} />
    <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#929292" }}>
      Loading drills...
    </Typography>
  </Box>
) : drills.length === 0 ? (
  <Box
    sx={{
      mt: 3,
      bgcolor: "#161616",
      border: "1px solid #1F1F1F",
      borderRadius: "12px",
      py: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
    }}
  >
    <Files size={28} color="#3A3A3A" />
    <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "15px", color: "#FFFFFF" }}>
      No drills found
    </Typography>
    <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#929292" }}>
      Upload your first drill to get started.
    </Typography>
  </Box>
) : (
  <Box
    sx={{
      mt: 3,
      display: "grid",
      gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" },
      gap: { xs: 2, md: 3 },
    }}
  >
  {drills.map((drill) => (
    <Box
  key={drill.id}
  onClick={() => navigate(`/drill/${drill.id}`)}
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
      {/* Image */}
      {drill.image ? (
        <Box
          component="img"
          src={drill.image}
            sx={{
              width: "100%",
              height: { xs: 120, sm: 150, md: 180 },
              objectFit: "cover",
            }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 180,
            bgcolor: "#2A2A2A",
          }}
        />
      )}

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "15px",
            color: "#FFFFFF",
            mb: 0.8,
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
            mb: 1.8,
          }}
        >
          {drill.coach} • {drill.category}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.7,
          }}
        >
          <Eye
            size={15}
            color="#FFFFFF"
          />

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "11px",
              color: "#929292",
            }}
          >
            {drill.views}
          </Typography>
        </Box>
      </Box>
    </Box>
  ))}
  </Box>
)}
      {/* Upload Drill Modal */}
      <Dialog
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontFamily: "Inter", fontWeight: 600, fontSize: "20px", color: "#FFFFFF" }}>
              Upload Drill
            </Typography>
            <IconButton onClick={() => setUploadModalOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />

          {/* Title */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Drill Title
          </Typography>
          <TextField
            placeholder="E.g Killer Crossover"
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

          {/* Description */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Drill Description
          </Typography>
          <TextField
            placeholder="Describe the drill..."
            variant="outlined"
            fullWidth
            multiline
            minRows={3}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
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
              "& textarea::placeholder": {
                color: "#5A5A5A",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                opacity: 1,
              },
            }}
          />

          {/* Skill Category + Level + Duration */}
          <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Skill Category
              </Typography>
              <Select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
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
                <MenuItem value="Dribbling">Dribbling</MenuItem>
                <MenuItem value="Shooting">Shooting</MenuItem>
                <MenuItem value="Defence">Defence</MenuItem>
                <MenuItem value="Passing">Passing</MenuItem>
                <MenuItem value="Fitness">Fitness</MenuItem>
              </Select>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Level
              </Typography>
              <Select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
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
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Duration
              </Typography>
              <Select
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
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
                <MenuItem value="5 min">5 min</MenuItem>
                <MenuItem value="10 min">10 min</MenuItem>
                <MenuItem value="15 min">15 min</MenuItem>
                <MenuItem value="20 min">20 min</MenuItem>
                <MenuItem value="30 min">30 min</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Equipment Required */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Equipment Required
          </Typography>
          <Select
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
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
            <MenuItem value="Dumbell">Dumbell</MenuItem>
            <MenuItem value="Skipping rope">Skipping rope</MenuItem>
            <MenuItem value="Weight">Weight</MenuItem>
          </Select>

          {/* Coach */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Coach
          </Typography>
          <TextField
            placeholder="E.g Coach Marcus"
            variant="outlined"
            fullWidth
            value={newCoach}
            onChange={(e) => setNewCoach(e.target.value)}
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

          {/* Upload Thumbnail */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Upload Thumbnail
          </Typography>
          <Box
            onClick={() => document.getElementById("drill-thumb-input").click()}
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
              {thumbFile ? thumbFile.name : "Click to upload thumbnail"}
            </Typography>
            <input
              id="drill-thumb-input"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
            />
          </Box>

          {/* Upload Drill Video */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Upload Drill Video
          </Typography>
          <Box
            onClick={() => document.getElementById("drill-video-input").click()}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              border: "1px dashed #2A2A2A",
              borderRadius: "10px",
              bgcolor: "#121212",
              py: 2,
              mb: 3,
              cursor: "pointer",
              "&:hover": { borderColor: "#3A3A3A", bgcolor: "#161616" },
            }}
          >
            <Video size={18} color="#929292" />
            <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#A0A0A0" }}>
              {videoFile ? videoFile.name : "Click to upload drill video"}
            </Typography>
            <input
              id="drill-video-input"
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </Box>

          {/* Buttons */}
          {uploadError && (
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
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "13px",
                  color: "#FF6B6B",
                }}
              >
                {uploadError}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              onClick={() => setUploadModalOpen(false)}
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
              onClick={handleCreateDrill}
              disabled={creating}
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
                "&.Mui-disabled": { bgcolor: "#E50914", color: "#FFFFFF", opacity: 0.6 },
              }}
            >
              {creating ? "Uploading..." : "Upload"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}