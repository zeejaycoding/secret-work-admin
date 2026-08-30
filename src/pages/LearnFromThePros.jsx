import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Switch,
} from "@mui/material";
import {
  GraduationCap,
  Plus,
  RefreshCw,
  X,
  ImagePlus,
  Star,
  Home,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { getPros, createPro, updatePro, deletePro } from "../services/api";

const PRO_ORDER = ["latin", "cooper", "corey", "destiny", "jayson"];

const rankPro = (name) => {
  const n = String(name || "").toLowerCase();
  const i = PRO_ORDER.findIndex((k) => n.includes(k));
  return i === -1 ? PRO_ORDER.length : i;
};

export default function LearnFromThePros() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTeam, setNewTeam] = useState("");
  const [newSessions, setNewSessions] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [addError, setAddError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const bannerPro = pros.find((p) => p.homepageBanner) || null;

  const fetchPros = () => {
    setLoading(true);
    getPros()
      .then((res) => {
        const list = res.data.pros || [];
        setPros(
          [...list].sort((a, b) => rankPro(a.name) - rankPro(b.name))
        );
      })
      .catch(() => setPros([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPros();
  }, []);

  const handleToggle = (pro, field, value) => {
    setPros((prev) => {
      // When setting homepageBanner to true, clear it on all other pros locally
      if (field === "homepageBanner" && value) {
        return prev.map((p) =>
          p._id === pro._id ? { ...p, [field]: true } : { ...p, [field]: false }
        );
      }
      // Otherwise just update the single pro optimistically
      return prev.map((p) => (p._id === pro._id ? { ...p, [field]: value } : p));
    });
    updatePro(pro._id, { [field]: value }).catch(() => fetchPros());
  };

  const handleCreate = () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    setAddError("");
    const form = new FormData();
    form.append("name", newName.trim());
    form.append("team", newTeam.trim());
    if (newSessions.trim()) form.append("sessions", newSessions.trim());
    if (imageFile) form.append("image", imageFile);
    createPro(form)
      .then(() => {
        setNewName("");
        setNewTeam("");
        setNewSessions("");
        setImageFile(null);
        setAddModalOpen(false);
        fetchPros();
        setUploadSuccess("Athlete added successfully");
        setTimeout(() => setUploadSuccess(""), 4000);
      })
      .catch((err) => {
        const backendMsg = err.response?.data?.error;
        setAddError(backendMsg || "Failed to add athlete. Please try again.");
      })
      .finally(() => setCreating(false));
  };

  const handleFeatureFromPicker = (pro) => {
    handleToggle(pro, "homepageBanner", true);
    setChangeModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deletePro(deleteConfirm._id)
      .then(() => {
        setDeleteConfirm(null);
        fetchPros();
      })
      .catch(() => {
        setDeleteConfirm(null);
      });
  };

  const switchSx = {
    "& .MuiSwitch-switchBase": { color: "#FFFFFF" },
    "& .MuiSwitch-switchBase.Mui-checked": { color: "#FFFFFF" },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#E50914",
      opacity: 1,
    },
    "& .MuiSwitch-track": {
      backgroundColor: "#2A2A2A",
      opacity: 1,
    },
    "& .MuiSwitch-switchBase.Mui-checked:hover": {
      "@media (hover: none)": {},
    },
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: { xs: 2, md: 4 },
        }}
      >
        <GraduationCap size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Learn from the Pros
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
              fontSize: { xs: "20px", sm: "24px" },
              color: "#FFFFFF",
              mb: 1,
            }}
          >
            Learn From The Pros
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "13px",
              color: "#6B6B6B",
            }}
          >
            Featured athletes, breakdown sessions and homepage banner control.
          </Typography>
        </Box>

        <Button
          startIcon={<Plus size={18} color="#FFFFFF" />}
          onClick={() => {
            setAddError("");
            setAddModalOpen(true);
          }}
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
          Add athlete
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

      {/* Homepage Banner */}
      <Box
        sx={{
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "12px",
          boxShadow: "0px 4px 20px #00000066",
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "18px",
              color: "#FFFFFF",
              mb: 0.5,
            }}
          >
            Homepage Banner
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "12px",
              color: "#929292",
            }}
          >
            {bannerPro
              ? `${bannerPro.name} is currently featured on the homepage.`
              : "No athlete is currently featured on the homepage."}
          </Typography>
        </Box>

        <Button
          startIcon={<RefreshCw size={16} color="#FFFFFF" />}
          onClick={() => setChangeModalOpen(true)}
          disabled={pros.length === 0}
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
            "&.Mui-disabled": {
              bgcolor: "#1F1F1F",
              color: "#5A5A5A",
            },
          }}
        >
          Change
        </Button>
      </Box>

      {/* Athletes */}
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
            Loading athletes...
          </Typography>
        </Box>
      ) : pros.length === 0 ? (
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
          <GraduationCap size={28} color="#3A3A3A" />
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "15px", color: "#FFFFFF" }}>
            No athletes yet
          </Typography>
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#929292" }}>
            Add your first athlete to get started.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" },
            gap: { xs: 2, md: 3 },
          }}
        >
          {pros.map((pro) => (
            <Box
              key={pro._id}
              sx={{
                bgcolor: "#161616",
                border: "1px solid #1F1F1F",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0px 4px 20px #00000066",
                transition: ".25s",

                "&:hover": {
                  transform: "translateY(-4px)",
                  borderColor: "#3A3A3A",
                  boxShadow: "0px 8px 28px #00000099",
                },
              }}
            >
              {pro.imageUrl ? (
                <Box
                  component="img"
                  src={pro.imageUrl}
                  sx={{
                    width: "100%",
                    height: { xs: 120, sm: 150, md: 180 },
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 120, sm: 150, md: 180 },
                    bgcolor: "#2A2A2A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCap size={32} color="#5A5A5A" />
                </Box>
              )}

              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "16px",
                      color: "#FFFFFF",
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {pro.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(pro); }}
                    sx={{ color: "#E50914", p: 0.3, ml: 0.5, "&:hover": { color: "#FF6B6B" } }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>

                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "11px",
                    color: "#929292",
                    mb: 0.3,
                  }}
                >
                  {pro.team || "No team"}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "11px",
                    color: "#929292",
                  }}
                >
                  {pro.sessions} {pro.sessions === 1 ? "season" : "seasons"}
                </Typography>

                <Box sx={{ height: "1px", bgcolor: "#1F1F1F", my: 1.5 }} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      <Star size={14} color="#929292" />
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "11px",
                          color: "#FFFFFF",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Featured
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(pro.featured)}
                      onChange={(e) => handleToggle(pro, "featured", e.target.checked)}
                      sx={switchSx}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      <Home size={14} color="#929292" />
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "11px",
                          color: "#FFFFFF",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Homepage banner
                      </Typography>
                    </Box>
                    <Switch
                      checked={Boolean(pro.homepageBanner)}
                      onChange={(e) => handleToggle(pro, "homepageBanner", e.target.checked)}
                      sx={switchSx}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Add Athlete Modal */}
      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
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
              Add Athlete
            </Typography>
            <IconButton onClick={() => setAddModalOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Athlete Name
          </Typography>
          <TextField
            placeholder="E.g Damian Lillard"
            variant="outlined"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Team
          </Typography>
          <TextField
            placeholder="E.g Portland Trail Blazers"
            variant="outlined"
            fullWidth
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
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

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Number of Pro Seasons
          </Typography>
          <TextField
            placeholder="E.g 12"
            variant="outlined"
            fullWidth
            type="number"
            value={newSessions}
            onChange={(e) => setNewSessions(e.target.value)}
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

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Athlete Image
          </Typography>
          <Box
            onClick={() => document.getElementById("pro-image-input").click()}
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
            <ImagePlus size={18} color="#929292" />
            <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#A0A0A0" }}>
              {imageFile ? imageFile.name : "Click to upload image"}
            </Typography>
            <input
              id="pro-image-input"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </Box>

          {addError && (
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
                {addError}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              onClick={() => setAddModalOpen(false)}
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
              onClick={handleCreate}
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
              {creating ? "Adding..." : "Add"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Athlete Confirmation */}
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
              Delete Athlete
            </Typography>
            <IconButton onClick={() => setDeleteConfirm(null)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>
          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#929292", mb: 3 }}>
            Are you sure you want to delete "{deleteConfirm?.name}"? This will also remove all linked drills. This action cannot be undone.
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
              onClick={handleDelete}
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

      {/* Change Homepage Banner Modal */}
      <Dialog
        open={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
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
              Change Homepage Banner
            </Typography>
            <IconButton onClick={() => setChangeModalOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 2 }} />

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "13px", color: "#7A7A7A", mb: 2 }}>
            Select an athlete to feature on the homepage.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {pros.map((pro) => (
              <Box
                key={pro._id}
                onClick={() => handleFeatureFromPicker(pro)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  bgcolor: pro.homepageBanner ? "#2A0F12" : "#1F1F1F",
                  border: `1px solid ${pro.homepageBanner ? "#E50914" : "#2A2A2A"}`,
                  borderRadius: "10px",
                  px: 1.5,
                  py: 1.2,
                  cursor: "pointer",
                  transition: ".2s",
                  "&:hover": {
                    borderColor: pro.homepageBanner ? "#E50914" : "#3A3A3A",
                  },
                }}
              >
                {pro.imageUrl ? (
                  <Box
                    component="img"
                    src={pro.imageUrl}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      bgcolor: "#E50914",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <GraduationCap size={16} color="#FFFFFF" />
                  </Box>
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
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
                    {pro.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "11px",
                      color: "#929292",
                    }}
                  >
                    {pro.team || "No team"}
                  </Typography>
                </Box>

                {pro.homepageBanner ? (
                  <Box
                    sx={{
                      bgcolor: "#E50914",
                      borderRadius: "6px",
                      px: 1.2,
                      py: 0.4,
                      flexShrink: 0,
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
                      Active
                    </Typography>
                  </Box>
                ) : (
                  <ChevronRight size={16} color="#929292" style={{ flexShrink: 0 }} />
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
