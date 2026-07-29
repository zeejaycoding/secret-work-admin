import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";

import {
  Files,
  Upload,
  Search,
  Filter,
  ChevronDown,
  LayoutGrid,
  List,Eye
} from "lucide-react";
import Catch from "../assets/catch.jpg";
import Crossover from "../assets/crossover.jpg";
import Defense from "../assets/defense.jpg";
import Eurostep from "../assets/eurostep.jpg";
import { useNavigate } from "react-router-dom";
import { getDrills } from "../services/api";

const FALLBACK_DRILLS = [
  { id: 1, title: "Killer Crossover Combo", coach: "Coach Marcus", category: "Dribbling", views: "45.9k views", image: Crossover },
  { id: 2, title: "Catch & Shoot Form", coach: "Coach Daniel", category: "Shooting", views: "38.2k views", image: Catch },
  { id: 3, title: "Defensive Slides", coach: "Coach Alex", category: "Defense", views: "27.4k views", image: Defense },
  { id: 4, title: "Euro Step Finish", coach: "Coach Ryan", category: "Finishing", views: "19.8k views", image: Eurostep },
  { id: 5, title: "Fast Break Decision", coach: "Coach Mike", category: "IQ", views: "14.2k views", image: Crossover },
  { id: 6, title: "Pick & Roll Reads", coach: "Coach James", category: "Playmaking", views: "31.6k views", image: Catch },
  { id: 7, title: "Footwork Basics", coach: "Coach Ethan", category: "Footwork", views: "22.7k views", image: Defense },
  { id: 8, title: "Triple Threat Moves", coach: "Coach Noah", category: "Offense", views: "41.5k views", image: Eurostep },
];

function formatViews(n) {
  if (!n) return "0 views";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k views";
  return n + " views";
}

const IMGS = [Crossover, Catch, Defense, Eurostep];

export default function ContentLibrary() {
  const navigate = useNavigate();
  const [drills, setDrills] = useState(FALLBACK_DRILLS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const fetchDrills = (q, cat, st) => {
    const params = {};
    if (q) params.search = q;
    if (cat && cat !== "all") params.category = cat;
    if (st && st !== "all") params.status = st;
    getDrills(params)
      .then((res) => {
        if (res.data.drills && res.data.drills.length > 0) {
          setDrills(res.data.drills.map((d, i) => ({
            id: d._id,
            title: d.title,
            coach: d.coach,
            category: d.category,
            views: formatViews(d.views),
            image: d.imageUrl || IMGS[i % IMGS.length],
          })));
        }
      })
      .catch(() => {});
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
      renderValue={() => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Filter size={16} color="#FFFF" />
          All Categories
        </Box>
      )}
    >
      <MenuItem value="all">All Categories</MenuItem>
      <MenuItem value="dribbling">Dribbling</MenuItem>
      <MenuItem value="shooting">Shooting</MenuItem>
      <MenuItem value="defence">Defence</MenuItem>
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
      renderValue={() => "All Statuses"}
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
    </Box>
  );
}