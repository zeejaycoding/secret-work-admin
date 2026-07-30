import { useState } from "react";
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
} from "@mui/material";

import {
  Layers3,
  Upload,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutGrid,
  List,
  Eye,
  Plus,
  GripVertical,
  X,
} from "lucide-react";
import Catch from "../assets/catch.jpg";
import Crossover from "../assets/crossover.jpg";
import Defense from "../assets/defense.jpg";
import Eurostep from "../assets/eurostep.jpg";
import { useNavigate } from "react-router-dom";

const FALLBACK_PROGRAMS = [
  { id: 1, title: "Elite Guard Package", coach: "Coach Marcus", category: "Dribbling", drills: "12 drills", image: Crossover },
  { id: 2, title: "Sharpshooter Program", coach: "Coach Daniel", category: "Shooting", drills: "8 drills", image: Catch },
  { id: 3, title: "Lockdown Defender", coach: "Coach Alex", category: "Defense", drills: "10 drills", image: Defense },
  { id: 4, title: "Finishing School", coach: "Coach Ryan", category: "Finishing", drills: "6 drills", image: Eurostep },
  { id: 5, title: "Ball Handling Mastery", coach: "Coach Mike", category: "Dribbling", drills: "15 drills", image: Crossover },
  { id: 6, title: "Playmaker Blueprint", coach: "Coach James", category: "Playmaking", drills: "9 drills", image: Catch },
  { id: 7, title: "Footwork Foundation", coach: "Coach Ethan", category: "Footwork", drills: "7 drills", image: Defense },
  { id: 8, title: "Scoring Arsenal", coach: "Coach Noah", category: "Offense", drills: "11 drills", image: Eurostep },
];

export default function ProgramsCategories() {
  const navigate = useNavigate();
  const [programs] = useState(FALLBACK_PROGRAMS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [programDrills, setProgramDrills] = useState({
    "Elite Guard Package": ["Killer Crossover", "Hesitation Pull-up", "In & Out Dribble", "Between Legs Finish"],
    "Sharpshooter Program": ["Catch & Shoot", "Off Screen", "Spot Up", "Step Back"],
  });

  const [dragIndex, setDragIndex] = useState(null);
  const [dragProgram, setDragProgram] = useState(null);

  const handleDragStart = (programName, index) => {
    setDragIndex(index);
    setDragProgram(programName);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (programName, dropIndex) => {
    if (dragProgram !== programName || dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragProgram(null);
      return;
    }
    setProgramDrills((prev) => {
      const drills = [...prev[programName]];
      const [moved] = drills.splice(dragIndex, 1);
      drills.splice(dropIndex, 0, moved);
      return { ...prev, [programName]: drills };
    });
    setDragIndex(null);
    setDragProgram(null);
  };

  const moveDrill = (programName, fromIndex, toIndex) => {
    setProgramDrills((prev) => {
      const drills = [...prev[programName]];
      if (toIndex < 0 || toIndex >= drills.length) return prev;
      const [moved] = drills.splice(fromIndex, 1);
      drills.splice(toIndex, 0, moved);
      return { ...prev, [programName]: drills };
    });
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
        <Layers3 size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Programs & Categories
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
            Programs & Categories
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "13px",
              color: "#6B6B6B",
            }}
          >
            Group drills into structured programs with progression levels.
          </Typography>
        </Box>

        <Button
          startIcon={<Plus size={18} color="#FFFFFF" />}
          onClick={() => setCreateModalOpen(true)}
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
          New program
        </Button>
      </Box>

      {/* Categories + Programs side by side */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left - Categories */}
        <Box
          sx={{
            width: { md: "30%" },
            alignSelf: "flex-start",
            bgcolor: "#161616",
            border: "1px solid #1F1F1F",
            boxShadow: "0px 4px 20px #00000066",
            borderRadius: "12px",
            p: 2.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "16px",
              color: "#FFFFFF",
              mb: 1.5,
            }}
          >
            Categories
          </Typography>

          <Box sx={{ height: "1px", bgcolor: "#1F1F1F", mb: 0.5 }} />

          {[
            { name: "Dribbling", count: 12 },
            { name: "Shooting", count: 8 },
            { name: "Defence", count: 6 },
            { name: "Finishing", count: 10 },
            { name: "Fitness", count: 4 },
          ].map((cat) => (
            <Box
              key={cat.name}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1.2,
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
                {cat.name}
              </Typography>
              <Box
                sx={{
                  bgcolor: "#2A2A2A",
                  borderRadius: "6px",
                  px: 1.5,
                  py: 0.4,
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
                  {cat.count}
                </Typography>
              </Box>
            </Box>
          ))}

          <Button
            startIcon={<Plus size={16} color="#FFFFFF" />}
            sx={{
              mt: 1,
              width: "100%",
              bgcolor: "#1F1F1F",
              border: "1px solid #2A2A2A",
              borderRadius: "10px",
              color: "#D6D6D6",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "12px",
              py: 1.3,

              "&:hover": {
                bgcolor: "#1F1F1F",
                borderColor: "#3A3A3A",
              },
            }}
          >
            Add category
          </Button>
        </Box>

        {/* Right - Programs content */}
        <Box
          sx={{
            width: { md: "70%" },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {[
            {
              name: "Elite Guard Package",
              level: "Advanced",
              category: "Dribbling",
              duration: "12 weeks",
            },
            {
              name: "Sharpshooter Program",
              level: "Intermediate",
              category: "Shooting",
              duration: "8 weeks",
            },
          ].map((program) => {
            const drills = programDrills[program.name] || [];
            return (
            <Box
              key={program.name}
              sx={{
                bgcolor: "#161616",
                border: "1px solid #1F1F1F",
                boxShadow: "0px 4px 20px #00000066",
                borderRadius: "12px",
                p: { xs: 1.5, sm: 2.5 },
              }}
            >
              {/* Header */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "#E50914",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Layers3 size={20} color="#FFFFFF" />
                </Box>
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "16px", color: "#FFFFFF" }}>
                  {program.name}
                </Typography>
              </Box>

              {/* Tags */}
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Box sx={{ bgcolor: "#1F1F1F", borderRadius: "8px", px: 2, py: 0.6 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: "#FFFFFF" }}>
                    {program.level}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "#1F1F1F", borderRadius: "8px", px: 2, py: 0.6 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: "#FFFFFF" }}>
                    {program.category}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "#1F1F1F", borderRadius: "8px", px: 2, py: 0.6 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "12px", color: "#FFFFFF" }}>
                    {program.duration}
                  </Typography>
                </Box>
              </Box>

              {/* Divider */}
              <Box sx={{ height: "1px", bgcolor: "#1F1F1F", mb: 2 }} />

              {/* Drill Order Label */}
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "#6B6B6B",
                  mb: 1.5,
                }}
              >
                Drill order (drag to reorder)
              </Typography>

              {/* Drill List */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {drills.map((drill, i) => (
                  <Box
                    key={drill}
                    draggable
                    onDragStart={() => handleDragStart(program.name, i)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(program.name, i)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: "#1F1F1F",
                      border: "1px solid #2A2A2A",
                      borderRadius: "10px",
                      px: 1.5,
                      py: 1.3,
                      opacity: dragProgram === program.name && dragIndex === i ? 0.4 : 1,
                    }}
                  >
                    <GripVertical size={16} color="#FFFFFF" style={{ cursor: "grab" }} />
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#6B6B6B",
                        minWidth: 20,
                      }}
                    >
                      {i + 1}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#FFFFFF",
                        flex: 1,
                      }}
                    >
                      {drill}
                    </Typography>
                    <ChevronUp size={16} color="#FFFFFF" style={{ cursor: "pointer" }} onClick={() => moveDrill(program.name, i, i - 1)} />
                    <ChevronDown size={16} color="#FFFFFF" style={{ cursor: "pointer" }} onClick={() => moveDrill(program.name, i, i + 1)} />
                    <ChevronRight size={16} color="#FFFFFF" style={{ cursor: "pointer" }} onClick={() => navigate(`/program/${i + 1}`, { state: { program, drillName: drill } })} />
                  </Box>
                ))}
              </Box>
            </Box>
            );
          })}
        </Box>
      </Box>

      {/* Create Program Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
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
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontFamily: "Inter", fontWeight: 600, fontSize: "20px", color: "#FFFFFF" }}>
              Create Program
            </Typography>
            <IconButton onClick={() => setCreateModalOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />

          {/* Project Name */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Project Name
          </Typography>
          <TextField
            placeholder="E.g Big foot man"
            variant="outlined"
            fullWidth
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

          {/* Category + Level */}
          <Box sx={{ display: "flex", gap: 2, mb: 2.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Category
              </Typography>
              <Select
                defaultValue="all"
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
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="dribbling">Dribbling</MenuItem>
                <MenuItem value="shooting">Shooting</MenuItem>
                <MenuItem value="defence">Defence</MenuItem>
                <MenuItem value="passing">Passing</MenuItem>
                <MenuItem value="fitness">Fitness</MenuItem>
              </Select>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
                Level
              </Typography>
              <Select
                defaultValue="beginner"
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
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Duration */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Duration
          </Typography>
          <Select
            defaultValue="4"
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
              mb: 3,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1A1A1A" },
              "& .MuiSelect-select": { py: 1.5 },
            }}
            IconComponent={(props) => <ChevronDown {...props} size={18} color="#929292" />}
          >
            <MenuItem value="4">4 weeks</MenuItem>
            <MenuItem value="6">6 weeks</MenuItem>
            <MenuItem value="8">8 weeks</MenuItem>
            <MenuItem value="12">12 weeks</MenuItem>
          </Select>

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              onClick={() => setCreateModalOpen(false)}
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
              }}
            >
              Create
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

    </Box>
  );
}