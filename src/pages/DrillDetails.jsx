import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, LinearProgress} from "@mui/material";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ChevronRight
} from "lucide-react";
import Crossover from "../assets/crossover.jpg";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function DrillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Demo data for now
  const drill = {
    title: "Killer Crossover Combo",
    coach: "Coach Marcus",
    category: "Dribbling",
    duration: "12 min",
    status: "Published",
    views: "45.9k views",
  };

  const viewsData = [
  { day: "D1", views: 220 },
  { day: "D2", views: 310 },
  { day: "D3", views: 280 },
  { day: "D4", views: 430 },
  { day: "D5", views: 520 },
  { day: "D6", views: 610 },
  { day: "D7", views: 560 },
  { day: "D8", views: 720 },
  { day: "D9", views: 690 },
  { day: "D10", views: 810 },
  { day: "D11", views: 930 },
  { day: "D12", views: 1010 },
  { day: "D13", views: 980 },
  { day: "D14", views: 1180 },
];

  return (
    <Box>
      {/* Back */}
      <Box
        onClick={() => navigate("/content-library")}
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
          fontSize: "24px",
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

      {/* Status + Actions */}
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
              Published
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
              {drill.views}
            </Typography>
          </Box>
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
          }}
        >
          <Button
            startIcon={<Edit size={16} color="#FFFFFF" />}
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
    mt: 4,
    display: "grid",
    gridTemplateColumns: "7fr 3fr",
    gap: 3,
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
    <Box
      component="img"
      src={Crossover}
      sx={{
        width: "100%",
        height: 340,
        objectFit: "cover",
      }}
    />

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
        Master the killer crossover combo to create separation from defenders,
        improve ball handling under pressure and develop quick change-of-direction
        skills for game situations.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 2,
        }}
      >
        {[
          ["98%", "Completion"],
          ["6m 12s", "Avg Watch"],
          ["3,240", "Likes"],
          ["Sep 9, 2026", "Date Published"],
        ].map(([value, label]) => (
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
      sx={{
        bgcolor: "#161616",
        border: "1px solid #1F1F1F",
        borderRadius: "12px",
        boxShadow: "0px 4px 20px #00000066",
        p: 2.5,
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
              CM
            </Typography>
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "16px",
                color: "#FFFFFF",
                mb: .5,
              }}
            >
              Coach Marcus
            </Typography>

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "12px",
                color: "#929292",
              }}
            >
              54 Drills • 12.8k Followers
            </Typography>
          </Box>
        </Box>

        <ChevronRight
          size={20}
          color="#929292"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/coaches/1")}
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
          87% Complete
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
        value={87}
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

  <Box sx={{ width: "100%", height: 340 }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={viewsData}>
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
  );
}