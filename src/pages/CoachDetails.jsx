import { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Dialog, DialogContent, DialogActions } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CircleX, MessageCircle, Eye } from "lucide-react";
import { getCoach, deleteCoach } from "../services/api";

function formatViews(n) {
  if (!n) return "0 views";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k views";
  return n + " views";
}

function formatCount(n) {
  if (!n) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function coachInitials(name) {
  const stripped = String(name || "")
    .replace(/^coach\s+/i, "")
    .trim();
  const first = stripped.split(/\s+/).find(Boolean);
  return ("C" + (first ? first[0] : "")).toUpperCase();
}

export default function CoachDetails() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);
  const [stats, setStats] = useState(null);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getCoach(name)
      .then((res) => {
        if (!mounted) return;
        setCoach(res.data.coach);
        setStats(res.data.stats);
        setDrills(res.data.drills || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.response?.data?.error || "Failed to load coach");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [name]);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await deleteCoach(name);
      navigate("/content");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete coach");
      setRemoving(false);
      setRemoveOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: "#E50914" }} />
      </Box>
    );
  }

  if (error || !coach) {
    return (
      <Box>
        <Box
          onClick={() => navigate(-1)}
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
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "13px", color: "#FFFFFF" }}>
            Back
          </Typography>
        </Box>
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "14px", color: "#E50914" }}>
          {error || "Coach not found"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        onClick={() => navigate(-1)}
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
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "13px", color: "#FFFFFF" }}>
          Back
        </Typography>
      </Box>

      {/* Coach Label */}
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#929292",
          mb: 1,
        }}
      >
        Coach
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
        {coach.name}
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
        Trainer • {formatCount(stats.followers)} Followers • {stats.drills} Drills Published
      </Typography>

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
          {/* Published */}
          <Box
            sx={{
              bgcolor: "#132018",
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
                color: "#22C55E",
              }}
            >
              Top Performer
            </Typography>
          </Box>
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            width: { xs: "100%", sm: "auto" },
            flexDirection: { xs: "row", sm: "row" },
          }}
        >
          <Button
            startIcon={removing ? <CircularProgress size={14} color="inherit" /> : <CircleX size={16} color="#E50914" />}
            onClick={() => setRemoveOpen(true)}
            disabled={removing}
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
              flex: { xs: 1, sm: "unset" },
              "&:hover": {
                bgcolor: "#2A0606",
                borderColor: "#E50914",
              },
            }}
          >
            Remove
          </Button>

          <Button
            startIcon={<MessageCircle size={16} color="#FFFFFF" />}
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
              flex: { xs: 1, sm: "unset" },
              "&:hover": {
                bgcolor: "#1F1F1F",
                borderColor: "#3A3A3A",
              },
            }}
          >
            Message
          </Button>
        </Box>
      </Box>

      {/* Coach Bio Card */}
      <Box
        sx={{
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          boxShadow: "0px 4px 12px #00000066",
          borderRadius: "12px",
          p: 2.5,
          mt: 3,
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 2 }}>
          {coach.imageUrl ? (
            <Box
              component="img"
              src={coach.imageUrl}
              alt={coach.name}
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "#E50914",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "18px", color: "#FFFFFF" }}>
                {coachInitials(coach.name)}
              </Typography>
            </Box>
          )}
          <Box>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "18px", color: "#FFFFFF", mb: 0.5 }}>
              {coach.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "12px",
                color: "#929292",
                lineHeight: "18px",
              }}
            >
              {coach.description || "No bio added yet."}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2,
          mt: 3,
        }}
      >
        {[
          { value: String(stats.drills), label: "Drills" },
          { value: formatCount(stats.followers), label: "Followers" },
          { value: `${stats.avgCompletion}%`, label: "Avg Completion" },
          { value: formatViews(stats.totalViews), label: "Total views" },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              boxShadow: "0px 4px 12px #00000066",
              borderRadius: "12px",
              textAlign: "left",
              px: 2.5,
              py: 2.5,
            }}
          >
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "15px", color: "#FFFFFF", mb: 0.5 }}>
              {stat.value}
            </Typography>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "11px", color: "#929292" }}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Published Drills */}
      <Box
        sx={{
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          boxShadow: "0px 4px 20px #00000066",
          borderRadius: "12px",
          mt: 3,
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
          Published drills
        </Typography>

        {drills.length === 0 ? (
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "13px", color: "#929292" }}>
            No published drills yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" },
              gap: { xs: 2, md: 3 },
            }}
          >
            {drills.map((drill) => (
              <Box
                key={drill._id}
                onClick={() => navigate(`/drill/${drill._id}`)}
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
                      height: { xs: 120, sm: 150, md: 180 },
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 120, sm: 150, md: 180 },
                      bgcolor: "#2A2A2A",
                    }}
                  />
                )}
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

      {/* Remove Coach Dialog */}
      <Dialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#0B0B0B",
            border: "1px solid #2A2A2A",
            borderRadius: "16px",
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "18px", color: "#FFFFFF", mb: 1 }}>
            Remove {coach.name}?
          </Typography>
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "13px", color: "#929292", lineHeight: "20px" }}>
            This will permanently delete this coach, all {stats.drills} published drill{stats.drills === 1 ? "" : "s"}, their followers and account. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setRemoveOpen(false)}
            disabled={removing}
            sx={{
              color: "#929292",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "13px",
              "&:hover": { bgcolor: "#1F1F1F" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemove}
            disabled={removing}
            startIcon={removing ? <CircularProgress size={14} color="inherit" /> : <CircleX size={16} />}
            sx={{
              bgcolor: "#E50914",
              color: "#FFFFFF",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "13px",
              borderRadius: "10px",
              px: 2.5,
              py: 1,
              "&:hover": { bgcolor: "#C70812" },
            }}
          >
            {removing ? "Removing..." : "Remove Coach"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
