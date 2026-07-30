import { Box, Typography, Button, LinearProgress } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CircleX, MessageCircle, Eye, Layers3, ChevronRight } from "lucide-react";
import Crossover from "../assets/crossover.jpg";
import Catch from "../assets/catch.jpg";
import Defense from "../assets/defense.jpg";
import Eurostep from "../assets/eurostep.jpg";

export default function ProgramDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const program = location.state?.program || { name: "Program", level: "", duration: "" };
  const drillName = location.state?.drillName || "Killer Crossover";

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

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#929292",
          mb: 1,
        }}
      >
        Program
      </Typography>

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: { xs: "18px", sm: "20px", md: "24px" },
          color: "#FFFFFF",
          mb: 1,
        }}
      >
        {drillName}
      </Typography>

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#929292",
          mb: 3,
        }}
      >
        {program.name} . {program.level} . {program.duration}
      </Typography>

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
              Published
            </Typography>
          </Box>
        </Box>

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

    
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 2,
          mt: 3,
        }}
      >
        {[
          { value: "421", label: "Enrolled" },
          { value: "87%", label: "Completion" },
          { value: "4.5", label: "Reviews" },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              boxShadow: "0px 4px 12px #00000066",
            borderRadius: "12px",
            textAlign: "left",
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.5, sm: 2.5 },
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

      {/* Drill Timeline + Enrolled Users */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left - Drill Timeline */}
        <Box
          sx={{
            width: { md: "50%" },
            bgcolor: "#161616",
            border: "1px solid #1F1F1F",
            boxShadow: "0px 4px 20px #00000066",
            borderRadius: "12px",
            p: { xs: 1.5, sm: 2.5 },
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
            Drill Timeline
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[
              { name: "Killer Crossover", pct: 92 },
              { name: "Hesitation Pull-up", pct: 78 },
              { name: "In & Out Dribble", pct: 45 },
              { name: "Between Legs Finish", pct: 63 },
            ].map((d) => (
              <Box
                key={d.name}
                sx={{
                  bgcolor: "#1F1F1F",
                  borderRadius: "10px",
                  px: 1.5,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                }}
              >
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "14px", color: "#FFFFFF", minWidth: 120, mr: 1.5 }}>
                  {d.name}
                </Typography>
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "11px", color: "#FFFFFF", minWidth: 35, mr: 0.8 }}>
                  {d.pct}% Complete  
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={d.pct}
                  sx={{
                    flex: 1,
                    height: 9,
                    borderRadius: 4,
                    bgcolor: "#2A2A2A",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#22C55E",
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right - Enrolled Users */}
        <Box
          sx={{
            width: { md: "50%" },
            bgcolor: "#161616",
            border: "1px solid #1F1F1F",
            boxShadow: "0px 4px 20px #00000066",
            borderRadius: "12px",
            p: { xs: 1.5, sm: 2.5 },
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
            Enrolled Users
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {["Marcus Johnson", "Daniel Lee", "Alex Rivera", "Ryan Chen", "Mike Thompson"].map((user) => (
              <Box
                key={user}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "#1F1F1F",
                  border: "1px solid #1F1F1F",
                  boxShadow: "0px 4px 20px #00000066",
                  borderRadius: "10px",
                  px: 1.5,
                  py: 1.3,
                  cursor: "pointer",
                }}
              >
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "14px", color: "#FFFFFF" }}>
                  {user}
                </Typography>
                <ChevronRight size={16} color="#FFFFFF" />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

    </Box>
  );
}