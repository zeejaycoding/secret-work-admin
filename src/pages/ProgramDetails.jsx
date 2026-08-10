import { useState, useEffect } from "react";
import { Box, Typography, Button, LinearProgress, CircularProgress, Dialog, DialogContent, IconButton, Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CircleX,
  MessageCircle,
  Eye,
  Layers3,
  ChevronRight,
  GripVertical,
  X,
} from "lucide-react";
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
import { getProgram, updateProgram, removeDrillFromProgram, deleteProgram } from "../services/api";

const getDrillId = (item, i) => {
  const id = item.drill?._id || item._id;
  return id ? String(id) : `drill-${i}`;
};

const SortableDrillRow = ({ id, index, item, totalUsers, onOpen, onRemove }) => {
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
  const pct =
    drill && typeof drill === "object" ? drill.completionRate || 0 : 0;

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      sx={{
        bgcolor: "#1F1F1F",
        borderRadius: "10px",
        px: 1.5,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: { xs: "wrap", md: "nowrap" },
        rowGap: 1,
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

      {drill?.imageUrl ? (
        <Box
          component="img"
          src={drill.imageUrl}
          sx={{
            width: 44,
            height: 44,
            borderRadius: "8px",
            objectFit: "cover",
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        />
      ) : (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "8px",
            bgcolor: "#2A2A2A",
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        />
      )}

      <Box sx={{ flex: { xs: "1 1 auto", md: 1 }, minWidth: 0 }}>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "14px",
            color: "#FFFFFF",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {drillName}
        </Typography>
        {drill && (drill.coach || drill.category) ? (
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "11px",
              color: "#929292",
            }}
          >
            {drill.coach ? `${drill.coach} • ` : ""}
            {drill.category || ""}
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "11px",
              color: "#FFFFFF",
            }}
          >
            {pct}%
          </Typography>
          {typeof drill?.completions === "number" ? (
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "10px",
                color: "#929292",
                whiteSpace: "nowrap",
              }}
            >
              {drill.completions} of {totalUsers ?? "—"} users
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ width: 90 }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#2A2A2A",
              "& .MuiLinearProgress-bar": {
                bgcolor: pct > 0 ? "#22C55E" : "#6B6B6B",
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Box>

      <ChevronRight
        size={16}
        color="#FFFFFF"
        style={{ cursor: "pointer" }}
        onClick={onOpen}
      />

      <Box
        onClick={(e) => {
          e.stopPropagation();
          if (onRemove) onRemove(id);
        }}
        title="Remove from program"
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          color: "#6B6B6B",
          "&:hover": { color: "#E50914" },
        }}
      >
        <X size={16} />
      </Box>
    </Box>
  );
};

export default function ProgramDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [program, setProgram] = useState(location.state?.program || null);
  const [loading, setLoading] = useState(!program);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notify, setNotify] = useState({ open: false, msg: "" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    let active = true;
    getProgram(id)
      .then((res) => {
        if (active) setProgram(res.data.program);
      })
      .catch((err) => {
        console.error("Failed to load program:", err?.message || err);
        if (active) setProgram(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const progDrills = (program?.drills || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortableIds = progDrills.map((item, i) => getDrillId(item, i));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !program) return;

    const oldIndex = sortableIds.indexOf(active.id);
    const newIndex = sortableIds.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(progDrills, oldIndex, newIndex).map(
      (d, i) => ({ ...d, order: i + 1 })
    );
    const payload = reordered.map((d) => ({
      drill: d.drill?._id || d.drill,
      order: d.order,
    }));
    const prev = program;
    setProgram((prevP) => (prevP ? { ...prevP, drills: reordered } : prevP));
    updateProgram(id, { drills: payload }).catch((err) => {
      console.error("Failed to reorder drills:", err?.message || err);
      setProgram(prev);
      setNotify({ open: true, msg: "Failed to reorder drills" });
    });
  };

  const handleRemoveDrill = (drillId) => {
    const prev = program;
    const filtered = (program?.drills || []).filter((d) => getDrillId(d) !== drillId);
    setProgram((prevP) => (prevP ? { ...prevP, drills: filtered } : prevP));
    removeDrillFromProgram(id, drillId)
      .then((res) => {
        if (res.data?.program) setProgram(res.data.program);
      })
      .catch((err) => {
        console.error("Failed to remove drill from program:", err?.message || err);
        setProgram(prev);
        setNotify({ open: true, msg: "Failed to remove drill" });
      });
  };

  const handleDeleteProgram = () => {
    if (!id || deleting) return;
    setDeleting(true);
    deleteProgram(id)
      .then(() => {
        setDeleteOpen(false);
        navigate("/programs");
      })
      .catch((err) => {
        console.error("Failed to delete program:", err?.message || err);
      })
      .finally(() => setDeleting(false));
  };

  const statusLabel = program?.status
    ? program.status.charAt(0).toUpperCase() + program.status.slice(1)
    : "Published";

  const progCompletion =
    program?.drills && program.drills.length && program.totalUsers
      ? Math.min(
          100,
          Math.round(
            (program.drills.reduce(
              (sum, d) => sum + (d.drill?.completions || 0),
              0
            ) /
              program.drills.length /
              program.totalUsers) *
              100
          )
        )
      : 0;

  const stats = [
    { value: program?.enrolled ?? 0, label: "Enrolled" },
    {
      value: `${progCompletion}%`,
      label: "Avg completion",
    },
    { value: program?.reviews ?? 0, label: "Reviews" },
  ];

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
        {program?.name || "Program"}
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
        {[program?.level, program?.category, program?.duration]
          .filter(Boolean)
          .join(" . ")}
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
              {statusLabel}
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
            onClick={() => setDeleteOpen(true)}
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
        {stats.map((stat) => (
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
            width: { md: "55%" },
            bgcolor: "#161616",
            border: "1px solid #1F1F1F",
            boxShadow: "0px 4px 20px #00000066",
            borderRadius: "12px",
            p: { xs: 1.5, sm: 2.5 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "16px",
                color: "#FFFFFF",
              }}
            >
              Drill Timeline
            </Typography>
            <Box
              sx={{
                bgcolor: "#2A2A2A",
                borderRadius: "6px",
                px: 1.2,
                py: 0.3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#FFFFFF",
                }}
              >
                {progDrills.length}
              </Typography>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress sx={{ color: "#E50914" }} />
            </Box>
          ) : progDrills.length === 0 ? (
            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "13px",
                color: "#6B6B6B",
                textAlign: "center",
                py: 5,
              }}
            >
              No drills in this program yet
            </Typography>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {progDrills.map((item, i) => (
                    <SortableDrillRow
                      key={sortableIds[i]}
                      id={sortableIds[i]}
                      index={i}
                      item={item}
                      totalUsers={program?.totalUsers}
                      onOpen={() => navigate(`/drill/${getDrillId(item, i)}`)}
                      onRemove={handleRemoveDrill}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>
          )}

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "12px",
              color: "#6B6B6B",
              mt: 2,
            }}
          >
            Drag the handle to reorder drills
          </Typography>
        </Box>

        {/* Right - Enrolled Users */}
        <Box
          sx={{
            width: { md: "45%" },
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
            {program?.enrolledUsers?.length ? (
              program.enrolledUsers.map((u) => (
                <Box
                  key={u._id}
                  onClick={() => navigate(`/user/${u._id}`)}
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
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "14px", color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name}
                    </Typography>
                    <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "11px", color: "#929292", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </Typography>
                  </Box>
                  <ChevronRight size={16} color="#FFFFFF" />
                </Box>
              ))
            ) : (
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "#6B6B6B",
                  textAlign: "center",
                  py: 5,
                }}
              >
                No enrolled users yet
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Delete Program Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
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
              Remove Program
            </Typography>
            <IconButton onClick={() => setDeleteOpen(false)} sx={{ color: "#FFFFFF", p: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "#1A1A1A", mb: 3 }} />

          <Typography sx={{ fontFamily: "Inter", fontWeight: 500, fontSize: "14px", color: "#A0A0A0", mb: 3 }}>
            Are you sure you want to remove "{program?.name || "this program"}"? It will be deleted from the database and stop showing in the app and admin panel. This cannot be undone.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              onClick={() => setDeleteOpen(false)}
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
              onClick={handleDeleteProgram}
              disabled={deleting}
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
                "&.Mui-disabled": { bgcolor: "#E50914", color: "#FFFFFF", opacity: 0.6 },
              }}
            >
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={notify.open}
        autoHideDuration={4000}
        onClose={() => setNotify({ open: false, msg: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setNotify({ open: false, msg: "" })} severity="error" variant="filled">
          {notify.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
