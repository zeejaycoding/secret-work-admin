import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Switch,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  ArrowLeft,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { getRole, updateRole, removeRoleUser } from "../services/api";

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#E50914",
    "&:hover": { bgcolor: "rgba(229,9,20,0.1)" },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    bgcolor: "#E50914",
  },
};

export default function RoleDetailPage() {
  const navigate = useNavigate();
  const { key } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getRole(key)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [key]);

  const role = data?.role;
  const permissions = role?.permissions || {};
  const users = data?.users || [];

  const permissionEntries = Object.entries(permissions);

  const togglePermission = (permKey) => {
    if (!role) return;
    const next = { ...permissions, [permKey]: !permissions[permKey] };
    setSaving(true);
    updateRole(role.key, { permissions: next })
      .then((res) => {
        setData((prev) => ({
          ...prev,
          role: { ...prev.role, ...res.data.role },
        }));
      })
      .catch(() => {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Failed to update permission",
        });
      })
      .finally(() => setSaving(false));
  };

  const handleRemoveUser = (userId) => {
    if (!role) return;
    setRemovingId(userId);
    removeRoleUser(role.key, userId)
      .then(() => {
        setData((prev) => ({
          ...prev,
          users: prev.users.filter((u) => u._id !== userId),
        }));
        setSnackbar({
          open: true,
          severity: "success",
          message: "User removed from role",
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Failed to remove user",
        });
      })
      .finally(() => setRemovingId(null));
  };

  return (
    <Box>
      {/* Breadcrumb */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 4,
          cursor: "pointer",
          flexWrap: "wrap",
        }}
        onClick={() => navigate("/roles")}
      >
        <ArrowLeft size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
            whiteSpace: "nowrap",
          }}
        >
          Roles & Permissions
        </Typography>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#4A4A4A",
          }}
        >
          /
        </Typography>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#FFFFFF",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "…" : role?.label || "Role"}
        </Typography>
      </Box>

      {/* Heading */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "18px", sm: "20px", md: "24px" },
            color: "#FFFFFF",
            mb: 0.5,
          }}
        >
          {loading ? "…" : role?.label || "Role"}
        </Typography>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "12px", md: "13px" },
            color: "#6B6B6B",
          }}
        >
          Permissions, screen access and assigned users.
        </Typography>
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
            Loading role...
          </Typography>
        </Box>
      ) : !role ? (
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "14px",
            color: "#929292",
            textAlign: "center",
            py: 4,
          }}
        >
          Role not found
        </Typography>
      ) : (
        <>
          {/* Permissions */}
          <Box
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              p: 3,
              maxWidth: 900,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#FFFFFF",
                }}
              >
                Permissions
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#929292",
                }}
              >
                {role.granted}/{role.total}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 1.5,
              }}
            >
              {permissionEntries.map(([permKey, enabled]) => {
                const label = permKey
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");

                return (
                  <Box
                    key={permKey}
                    sx={{
                      bgcolor: "#1F1F1F",
                      border: "1px solid #2A2A2A",
                      borderRadius: "10px",
                      p: 1.5,
                      pl: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
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
                      {label}
                    </Typography>

                    <Switch
                      checked={!!enabled}
                      onChange={() => togglePermission(permKey)}
                      disabled={saving}
                      size="small"
                      sx={switchSx}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Assigned Users */}
          <Box
            sx={{
              mt: 4,
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              p: 3,
              maxWidth: 900,
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
              Assigned Users
            </Typography>

            {users.length === 0 ? (
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#929292",
                  textAlign: "center",
                  py: 4,
                }}
              >
                No users assigned to this role
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {users.map((u) => (
                  <Box
                    key={u._id}
                    sx={{
                      bgcolor: "#1F1F1F",
                      border: "1px solid #2A2A2A",
                      borderRadius: "10px",
                      p: 1.5,
                      pl: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#2A2A2A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {u.avatarUrl ? (
                        <Box
                          component="img"
                          src={u.avatarUrl}
                          alt={u.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "14px",
                            color: "#D6D6D6",
                          }}
                        >
                          {(u.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "13px",
                          color: "#FFFFFF",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {u.name || "Unknown user"}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "11px",
                          color: "#929292",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {u.email || "—"}
                      </Typography>
                    </Box>

                    <Button
                      onClick={() => handleRemoveUser(u._id)}
                      disabled={removingId === u._id}
                      sx={{
                        minWidth: 32,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        color: "#929292",
                        flexShrink: 0,

                        "&:hover": {
                          bgcolor: "rgba(229,9,20,0.12)",
                          color: "#E50914",
                        },

                        "&.Mui-disabled": {
                          color: "#4A4A4A",
                        },
                      }}
                    >
                      {removingId === u._id ? (
                        <CircularProgress size={14} sx={{ color: "#E50914" }} />
                      ) : (
                        <X size={16} />
                      )}
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </>
      )}

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
