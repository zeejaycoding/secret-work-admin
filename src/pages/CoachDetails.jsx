import { Box, Typography, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CircleX, MessageCircle, Eye } from "lucide-react";
import Crossover from "../assets/crossover.jpg";
import Catch from "../assets/catch.jpg";
import Defense from "../assets/defense.jpg";
import Eurostep from "../assets/eurostep.jpg";

export default function CoachDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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
        Marcus
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
              Head Trainer • 12k Followers • 46 Drills Published
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
                  startIcon={<CircleX size={16} color="#E50914" />}
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
              CM
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "18px", color: "#FFFFFF", mb: 0.5 }}>
              Coach Marcus
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
              15+ years coaching elite guards. Specializes in shot creation, ball handling and basketball IQ.
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
          { value: "12", label: "Drills" },
          { value: "12k", label: "Followers" },
          { value: "87%", label: "Avg Completion" },
          { value: "4.8k", label: "Total views" },
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(3, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" },
            gap: { xs: 2, md: 3 },
          }}
        >
          {[
            { id: 1, title: "Killer Crossover Combo", coach: "Coach Marcus", category: "Dribbling", views: "45.9k views", image: Crossover },
            { id: 2, title: "Catch & Shoot Form", coach: "Coach Daniel", category: "Shooting", views: "38.2k views", image: Catch },
            { id: 3, title: "Defensive Slides", coach: "Coach Alex", category: "Defense", views: "27.4k views", image: Defense },
            { id: 4, title: "Euro Step Finish", coach: "Coach Ryan", category: "Finishing", views: "19.8k views", image: Eurostep },
          ].map((drill) => (
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
              <Box
                component="img"
                src={drill.image}
                sx={{
                  width: "100%",
                  height: { xs: 120, sm: 150, md: 180 },
                  objectFit: "cover",
                }}
              />
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
                    {drill.views}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

    </Box>
  );
}
