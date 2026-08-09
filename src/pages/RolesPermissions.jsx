import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Switch,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  ShieldCheck,
  Plus,
  Users,
} from "lucide-react";

import { getRoles, updateRole, createRole } from "../services/api";

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#E50914",
    "&:hover": { bgcolor: "rgba(229,9,20,0.1)" },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    bgcolor: "#E50914",
  },
};

export default function RolesPermissionsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const fetchRoles = () => {
    setLoading(true);
    getRoles()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const roles = data?.roles || [];
  const permissions = data?.permissions || [];

  const togglePermission = (roleKey, permKey) => {
    const role = roles.find((r) => r.key === roleKey);
    if (!role) return;

    const next = { ...role.permissions, [permKey]: !role.permissions[permKey] };
    const optimistic = roles.map((r) =>
      r.key === roleKey ? { ...r, permissions: next } : r
    );
    setData((prev) => ({ ...prev, roles: optimistic }));
    setSavingKey(roleKey);

    updateRole(roleKey, { permissions: next })
      .then((res) => {
        setData((prev) => ({
          ...prev,
          roles: prev.roles.map((r) =>
            r.key === roleKey ? { ...r, ...res.data.role } : r
          ),
        }));
      })
      .catch(() => {
        setData((prev) => ({ ...prev, roles }));
        setSnackbar({
          open: true,
          severity: "error",
          message: "Failed to update permission",
        });
      })
      .finally(() => setSavingKey(null));
  };

  const handleCreate = () => {
    const label = newRole.trim();
    if (!label) return;
    setCreating(true);
    createRole({ label })
      .then((res) => {
        setAddOpen(false);
        setNewRole("");
        setSnackbar({
          open: true,
          severity: "success",
          message: "Role created",
        });
        fetchRoles();
      })
      .catch(() => {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Failed to create role",
        });
      })
      .finally(() => setCreating(false));
  };

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <ShieldCheck size={20} color="#929292" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Roles & Permissions
        </Typography>
      </Box>

      {/* Heading + Add Role */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: { xs: 3, md: 4 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "18px", sm: "20px", md: "24px" },
              color: "#FFFFFF",
              mb: 0.5,
            }}
          >
            Roles & Permissions
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "12px", md: "13px" },
              color: "#6B6B6B",
            }}
          >
            Control who can do what across the platform.
          </Typography>
        </Box>

        <Button
          startIcon={<Plus size={16} color="#FFFFFF" />}
          onClick={() => setAddOpen(true)}
          sx={{
            bgcolor: "#E50914",
            borderRadius: "10px",
            color: "#FFFFFF",
            textTransform: "none",
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "12px",
            px: 2.5,
            py: 1,
            boxShadow: "0px 4px 15px #F81B1B40",
            flexShrink: 0,

            "&:hover": {
              bgcolor: "#C10812",
            },
          }}
        >
          Add Role
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            py: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: "#E50914" }} />
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              color: "#929292",
            }}
          >
            Loading roles...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Stat Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            {roles.map((role) => (
              <Box
                key={role.key}
                onClick={() => navigate(`/role/${role.key}`)}
                sx={{
                  bgcolor: "#1F1F1F",
                  border: "1px solid #2A2A2A",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 20px #00000066",
                  p: 2.5,
                  cursor: "pointer",
                  transition: "all .2s",

                  "&:hover": {
                    borderColor: "#3A3A3A",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "#FFFFFF",
                    }}
                  >
                    {role.label}
                  </Typography>

                  <ShieldCheck size={20} color="#484848" />
                </Box>

                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "24px",
                    color: "#FFFFFF",
                  }}
                >
                  {role.granted}/{role.total}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "#929292",
                    mt: 0.5,
                  }}
                >
                  Permissions
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 2,
                    pt: 2,
                    borderTop: "1px solid #2A2A2A",
                  }}
                >
                  <Users size={14} color="#929292" />
                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#D6D6D6",
                    }}
                  >
                    {role.users.toLocaleString()} users
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Access Matrix */}
          <Box
            sx={{
              mt: 4,
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              p: 3,
              overflowX: "auto",
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
              Access Matrix
            </Typography>

            <Box sx={{ minWidth: 640 }}>
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `200px repeat(${roles.length}, 1fr)`,
                  gap: 1,
                  px: 2,
                  pb: 1.5,
                  borderBottom: "1px solid #2A2A2A",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "12px",
                    color: "#929292",
                  }}
                >
                  Permission
                </Typography>

                {roles.map((role) => (
                  <Typography
                    key={role.key}
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#FFFFFF",
                      textAlign: "center",
                    }}
                  >
                    {role.label}
                  </Typography>
                ))}
              </Box>

              {/* Permission rows */}
              {permissions.map((perm) => (
                <Box
                  key={perm.key}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `200px repeat(${roles.length}, 1fr)`,
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid #1F1F1F",
                    alignItems: "center",
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
                    {perm.label}
                  </Typography>

                  {roles.map((role) => {
                    const checked = !!role.permissions[perm.key];
                    const saving = savingKey === role.key;

                    return (
                      <Box
                        key={role.key}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {saving ? (
                          <CircularProgress size={16} sx={{ color: "#929292" }} />
                        ) : (
                          <Switch
                            checked={checked}
                            onChange={() =>
                              togglePermission(role.key, perm.key)
                            }
                            size="small"
                            sx={switchSx}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}

      {/* Add Role Dialog */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#161616",
            border: "1px solid #2A2A2A",
            borderRadius: "12px",
            width: 420,
            maxWidth: "92vw",
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "16px",
            color: "#FFFFFF",
          }}
        >
          Add Role
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Role name"
            inputProps={{
              sx: {
                fontFamily: "Inter",
                fontSize: "14px",
                color: "#FFFFFF",
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#1F1F1F",
                borderRadius: "10px",
                "& fieldset": { borderColor: "#2A2A2A" },
                "&.Mui-focused fieldset": { borderColor: "#E50914" },
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setAddOpen(false)}
            sx={{
              bgcolor: "#2A2A2A",
              borderRadius: "10px",
              color: "#D6D6D6",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "12px",
              px: 2.5,
              "&:hover": { bgcolor: "#363636" },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleCreate}
            disabled={creating || !newRole.trim()}
            sx={{
              bgcolor: "#E50914",
              borderRadius: "10px",
              color: "#FFFFFF",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "12px",
              px: 2.5,
              boxShadow: "0px 4px 15px #F81B1B40",
              "&:hover": { bgcolor: "#C10812" },
              "&.Mui-disabled": {
                bgcolor: "#3A3A3A",
                color: "#929292",
              },
            }}
          >
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            bgcolor: {
              success: "#1B5E20",
              error: "#B71C1C",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
