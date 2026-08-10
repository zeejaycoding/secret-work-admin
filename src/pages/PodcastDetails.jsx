import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import { ArrowLeft, PlayCircle, Headphones, ChevronRight } from "lucide-react";

import { getPodcast, transcribePodcast } from "../services/api";

const STATUS_META = {
  Published: { label: "Published", color: "#22C55E", bg: "#132018" },
  Scheduled: { label: "Scheduled", color: "#FF8D28", bg: "#1F1F1F" },
};

function getInitials(name) {
  return name
    .replace("Coach ", "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function PodcastDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptError, setTranscriptError] = useState("");

  const fetchPodcast = () =>
    getPodcast(id)
      .then((res) => setEpisode(res.data.podcast))
      .catch(() => setEpisode(null));

  useEffect(() => {
    setLoading(true);
    fetchPodcast().finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!episode || episode.transcriptStatus !== "pending") return;
    const t = setInterval(fetchPodcast, 5000);
    return () => clearInterval(t);
  }, [episode?.transcriptStatus]);

  const handleGenerateTranscript = async () => {
    setTranscribing(true);
    setTranscriptError("");
    // Optimistically mark pending so the polling effect stays active even if
    // the request returns early with a broken/null body.
    setEpisode((prev) => ({
      ...prev,
      transcriptStatus: "pending",
      transcript: [],
    }));
    try {
      const res = await transcribePodcast(id);
      const updated = res?.data?.podcast;
      if (updated) setEpisode(updated);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "Failed to generate transcript. It may still be processing in the background — check back shortly.";
      setTranscriptError(message);
    } finally {
      setTranscribing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#E50914" }} />
      </Box>
    );
  }

  if (!episode) {
    return (
      <Box>
        <Box
          onClick={() => navigate("/podcasts")}
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
          Episode not found
        </Typography>
      </Box>
    );
  }

  const statusMeta = STATUS_META[episode.status] || STATUS_META.Scheduled;
  const guestName = episode.guest || episode.host;

  return (
    <Box>
      {/* Back */}
      <Box
        onClick={() => navigate("/podcasts")}
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

      {/* Label */}
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#929292",
          mb: 1,
        }}
      >
        Podcast
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
        {episode.title}
      </Typography>

      {/* Meta */}
      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#929292",
          mb: 3,
          wordBreak: "break-word",
        }}
      >
        {episode.title} • {episode.host} • {episode.duration}
      </Typography>

      {/* Status + Plays */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: { xs: 3, md: 4 },
          flexWrap: "wrap",
        }}
      >
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
            {episode.plays} plays
          </Typography>
        </Box>
      </Box>

      {/* Player */}
      <Box
        sx={{
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "12px",
          boxShadow: "0px 4px 20px #00000066",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: { xs: 180, sm: 240, md: 340 },
            bgcolor: "#0D0D0D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 1.5,
            overflow: "hidden",
          }}
        >
          {episode.mediaUrl ? (
            episode.mediaType?.startsWith("video") || episode.type === "Video" ? (
              <video
                key={episode._id}
                src={episode.mediaUrl}
                controls
                preload="metadata"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <>
                <Box
                  sx={{
                    width: { xs: 64, sm: 80 },
                    height: { xs: 64, sm: 80 },
                    borderRadius: "50%",
                    bgcolor: "#1F1F1F",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Headphones size={36} color="#E50914" />
                </Box>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#929292",
                  }}
                >
                  {episode.type} • {episode.duration}
                </Typography>
                <audio
                  key={episode._id}
                  controls
                  src={episode.mediaUrl}
                  preload="metadata"
                  style={{ width: "85%", maxWidth: 480 }}
                />
              </>
            )
          ) : (
            <>
              <Box
                sx={{
                  width: { xs: 64, sm: 80 },
                  height: { xs: 64, sm: 80 },
                  borderRadius: "50%",
                  bgcolor: "#1F1F1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {episode.type === "Video" ? (
                  <PlayCircle size={36} color="#E50914" />
                ) : (
                  <Headphones size={36} color="#E50914" />
                )}
              </Box>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "13px",
                  color: "#929292",
                }}
              >
                {episode.type} • {episode.duration}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#5A5A5A",
                }}
              >
                No media uploaded for this episode yet
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Transcript + Guest */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 2, md: 3 },
          mt: { xs: 2, md: 3 },
          alignItems: "flex-start",
        }}
      >
        {/* Transcript */}
        <Box
          sx={{
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
              fontWeight: 600,
              fontSize: "16px",
              color: "#FFFFFF",
              mb: 2,
            }}
          >
            Transcript
          </Typography>

          {episode.transcript?.length > 0 ? (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {episode.transcript.map((line, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", gap: 1.5, alignItems: "baseline" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "15px",
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                      }}
                    >
                      [{line.time}]
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "15px",
                        color: "#929292",
                        lineHeight: 1.5,
                      }}
                    >
                      {line.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                component="button"
                onClick={handleGenerateTranscript}
                disabled={transcribing}
                sx={{
                  mt: 2.5,
                  bgcolor: "transparent",
                  color: "#929292",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  border: "1px solid #2A2A2A",
                  "&:hover": { color: "#FFFFFF", borderColor: "#3A3A3A" },
                }}
              >
                {transcribing ? "Regenerating..." : "Regenerate"}
              </Box>
              {transcriptError && (
                <Typography
                  sx={{
                    mt: 1,
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "12px",
                    color: "#FF6B6B",
                  }}
                >
                  {transcriptError}
                </Typography>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 4,
              }}
            >
              {transcribing ? (
                <CircularProgress size={28} sx={{ color: "#E50914" }} />
              ) : episode.transcriptStatus === "pending" ? (
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#929292",
                  }}
                >
                  Generating transcript... this may take a minute.
                </Typography>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "#929292",
                    }}
                  >
                    {episode.transcriptStatus === "failed"
                      ? "Transcription failed."
                      : "No transcript for this episode yet."}
                  </Typography>
                  <Box
                    component="button"
                    onClick={handleGenerateTranscript}
                    disabled={!episode.mediaUrl}
                    sx={{
                      bgcolor: "#1F1F1F",
                      color: "#FFFFFF",
                      fontFamily: "Inter",
                      fontWeight: 600,
                      fontSize: "13px",
                      textTransform: "none",
                      borderRadius: "10px",
                      px: 3,
                      py: 1.2,
                      cursor: "pointer",
                      border: "1px solid #2A2A2A",
                      "&:hover": { bgcolor: "#2A2A2A" },
                      "&.Mui-disabled": { opacity: 0.5 },
                    }}
                  >
                    Generate transcript
                  </Box>
                </>
              )}
              {transcriptError && (
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "12px",
                    color: "#FF6B6B",
                    textAlign: "center",
                  }}
                >
                  {transcriptError}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Guest */}
        <Box
          sx={{
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
              fontWeight: 600,
              fontSize: "16px",
              color: "#FFFFFF",
              mb: 2,
            }}
          >
            Guest
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
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
                    fontSize: "16px",
                    color: "#FFFFFF",
                  }}
                >
                  {getInitials(guestName)}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#FFFFFF",
                }}
              >
                {guestName}
              </Typography>
            </Box>
            <ChevronRight size={20} color="#929292" style={{ cursor: "pointer" }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
