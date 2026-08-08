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
} from "@mui/material";

import {
  Layers3,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getCategories,
  createCategory,
  getPrograms,
  createProgram,
  updateProgram,
} from "../services/api";

const getDrillId = (item, i) => {
  const id = item.drill?._id || item._id;
  return id ? String(id) : `drill-${i}`;
};

const SortableDrillRow = ({ id, index, item, onOpen }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const drill = item.drill;
  const drillName =
    drill && typeof drill === "object" ? drill.title || drill.name || "" : "";

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "#1F1F1F",
        border: "1px solid #2A2A2A",
        borderRadius: "10px",
        px: 1.5,
        py: 1.3,
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <GripVertical size={16} color="#FFFFFF" />
      </Box>

      <Typography
        sx={{
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "13px",
          color: "#6B6B6B",
          minWidth: 20,
        }}
      >
        {index + 1}
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
        {drillName}
      </Typography>

      <ChevronRight
        size={16}
        color="#FFFFFF"
        style={{ cursor: "pointer" }}
        onClick={onOpen}
      />
    </Box>
  );
};

const ProgramCard = ({ program, onReorder, onOpen }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const progDrills = (program.drills || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortableIds = progDrills.map((item, i) => getDrillId(item, i));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.indexOf(active.id);
    const newIndex = sortableIds.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(program._id, arrayMove(progDrills, oldIndex, newIndex));
  };

  return (
    <Box
      sx={{
        bgcolor: "#161616",
        border: "1px solid #1F1F1F",
        boxShadow: "0px 4px 20px #00000066",
        borderRadius: "12px",
        p: { xs: 1.5, sm: 2.5 },
      }}
    >
      {/* Header */}
      <Box
        onClick={() => onOpen(program, null)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          cursor: "pointer",
          "&:hover .program-title": { color: "#22C55E" },
        }}
      >
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
        <Typography
          className="program-title"
          sx={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "16px",
            color: "#FFFFFF",
            transition: "color .2s",
          }}
        >
          {program.name}
        </Typography>
        <ChevronRight
          size={16}
          color="#FFFFFF"
          style={{ marginLeft: "auto", flexShrink: 0 }}
        />
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
            {program.duration} weeks
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {progDrills.length === 0 ? (
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 400, fontSize: "13px", color: "#6B6B6B", textAlign: "center", py: 2 }}>
                No drills yet
              </Typography>
            ) : (
              progDrills.map((item, i) => (
                <SortableDrillRow
                  key={sortableIds[i]}
                  id={sortableIds[i]}
                  index={i}
                  item={item}
                  onOpen={() => onOpen(program, item)}
                />
              ))
            )}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default function ProgramsCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addCatModalOpen, setAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [createName, setCreateName] = useState("");
  const [createLevel, setCreateLevel] = useState("Beginner");
  const [createCat, setCreateCat] = useState("");
  const [createDuration, setCreateDuration] = useState("4 weeks");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCategories(),
      getPrograms({ search, category: filterCategory }),
    ])
      .then(([catRes, progRes]) => {
        setCategories(catRes.data.categories || []);
        setPrograms(progRes.data.programs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchPrograms = (q, cat) => {
    getPrograms({ search: q, category: cat })
      .then((res) => setPrograms(res.data.programs || []))
      .catch(() => {});
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    createCategory({ name: newCatName.trim() })
      .then(() => {
        setNewCatName("");
        setAddCatModalOpen(false);
        return getCategories();
      })
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  };

  const handleCreateProgram = () => {
    if (!createName.trim()) return;
    createProgram({ name: createName, level: createLevel, category: createCat, duration: createDuration })
      .then(() => {
        setCreateName("");
        setCreateLevel("Beginner");
        setCreateCat("");
        setCreateDuration("4 weeks");
        setCreateModalOpen(false);
        return getPrograms({ search, category: filterCategory });
      })
      .then((res) => setPrograms(res.data.programs || []))
      .catch(() => {});
  };

  const handleReorder = (programId, reordered) => {
    setPrograms((prev) =>
      prev.map((p) => {
        if (p._id !== programId) return p;
        const withOrder = reordered.map((d, i) => ({ ...d, order: i + 1 }));
        const payload = withOrder.map((d) => ({
          drill: d.drill?._id || d.drill,
          order: d.order,
        }));
        updateProgram(programId, { drills: payload }).catch(() => {});
        return { ...p, drills: withOrder };
      })
    );
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
            width: { xs: "100%", md: "30%" },
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

          {categories.map((cat) => (
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
                  {cat.drillCount}
                </Typography>
              </Box>
            </Box>
          ))}

          <Button
            startIcon={<Plus size={16} color="#FFFFFF" />}
            onClick={() => setAddCatModalOpen(true)}
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
          {programs.map((program) => (
            <ProgramCard
              key={program._id}
              program={program}
              onReorder={handleReorder}
              onOpen={(prog, item) => {
                const drill =
                  item && item.drill && typeof item.drill === "object"
                    ? item.drill
                    : null;
                const drillName = drill
                  ? drill.title || drill.name || ""
                  : "";
                navigate(`/program/${prog._id}`, {
                  state: { program: prog, drillName },
                });
              }}
            />
          ))}
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
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
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
                value={createCat}
                onChange={(e) => setCreateCat(e.target.value)}
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
                value={createLevel}
                onChange={(e) => setCreateLevel(e.target.value)}
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
          </Box>

          {/* Duration */}
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Duration
          </Typography>
          <Select
            value={createDuration}
            onChange={(e) => setCreateDuration(e.target.value)}
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
              onClick={handleCreateProgram}
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

      {/* Add Category Modal */}
      <Dialog
        open={addCatModalOpen}
        onClose={() => setAddCatModalOpen(false)}
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
              Add Category
            </Typography>
            <IconButton onClick={() => { setAddCatModalOpen(false); setNewCatName(""); }} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>
          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />
          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#7A7A7A", mb: 1 }}>
            Category Name
          </Typography>
          <TextField
            placeholder="e.g. Finishing"
            variant="outlined"
            fullWidth
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            sx={{
              mb: 3,
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
            <Button
              onClick={() => { setAddCatModalOpen(false); setNewCatName(""); }}
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
              onClick={handleAddCategory}
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
              Add
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

    </Box>
  );
}