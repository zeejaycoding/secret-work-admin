import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  ArrowLeft,
  DollarSign,
  Check,
  Ban,
  Save,
  CalendarRange,
  ListChecks,
} from "lucide-react";

import { getPlanDetail, updatePlan } from "../services/api";

const normalizeBenefits = (list) =>
  (list || []).map((b) => {
    if (typeof b === "string") return { text: b, enabled: true };
    const text = b?.text || b?.benefit || b?.name || b?.title || "";
    return { text: String(text).trim(), enabled: !!b?.enabled };
  });

export default function EditPlanPage() {
  const navigate = useNavigate();
  const { key } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("month");
  const [benefits, setBenefits] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getPlanDetail(key)
      .then((res) => {
        const plan = res.data.plan || {};
        setLabel(plan.label || "");
        setAmount(String(plan.price?.amount ?? ""));
        setInterval(plan.price?.interval === "year" ? "year" : plan.key === "free" ? "" : "month");
        setBenefits(normalizeBenefits(plan.benefits));
      })
      .catch(() => {
        showSnackbar("Failed to load plan", "error");
      })
      .finally(() => setLoading(false));
  }, [key]);

  const toggleBenefit = (index) => {
    setBenefits((prev) =>
      prev.map((b, i) => (i === index ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const handleSave = async () => {
    const price = Number(amount);
    if (!Number.isFinite(price) || price < 0) {
      showSnackbar("Enter a valid price", "error");
      return;
    }
    if (key !== "free" && benefits.filter((b) => b.enabled).length === 0) {
      showSnackbar("At least one benefit must be enabled", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: label.trim(),
        price: {
          amount: price,
          interval: key === "free" ? "" : interval,
        },
        benefits,
      };
      await updatePlan(key, payload);
      showSnackbar("Plan updated successfully");
      setTimeout(() => navigate(`/plan/${key}`, { replace: true }), 800);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update plan";
      showSnackbar(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const planLabel = label || key;

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
        }}
        onClick={() => navigate(`/plan/${key}`)}
      >
        <ArrowLeft size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          {loading ? "Plan" : planLabel}
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
          }}
        >
          Edit Plan
        </Typography>
      </Box>

      {/* Heading + Actions */}
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
            Edit Plan
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "12px", md: "13px" },
              color: "#6B6B6B",
            }}
          >
            Update price, billing interval and benefits — changes reflect on the
            app immediately.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            startIcon={<ArrowLeft size={16} color="#FFFFFF" />}
            onClick={() => navigate(`/plan/${key}`)}
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
              flexShrink: 0,
              "&:hover": { bgcolor: "#1F1F1F", borderColor: "#3A3A3A" },
            }}
          >
            Cancel
          </Button>

          <Button
            startIcon={
              saving ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Save size={16} color="#FFFFFF" />
              )
            }
            onClick={handleSave}
            disabled={saving || loading}
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
              flexShrink: 0,
              "&:hover": { bgcolor: "#C10812" },
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            py: 8,
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
            Loading plan...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Pricing */}
          <Box
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <DollarSign size={18} color="#E50914" />
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#FFFFFF",
                }}
              >
                Pricing
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2.5,
              }}
            >
              <TextField
                label="Plan Name"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                InputLabelProps={{
                  sx: {
                    fontFamily: "Inter",
                    fontSize: "12px",
                    color: "#929292",
                  },
                }}
                inputProps={{
                  sx: { fontFamily: "Inter", fontSize: "14px", color: "#FFFFFF" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#1F1F1F",
                    borderRadius: "10px",
                    "& fieldset": { borderColor: "#2A2A2A" },
                    "&:hover fieldset": { borderColor: "#3A3A3A" },
                    "&.Mui-focused fieldset": { borderColor: "#E50914" },
                  },
                }}
              />

              <TextField
                label="Price (USD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                inputProps={{
                  min: 0,
                  step: "0.01",
                  sx: { fontFamily: "Inter", fontSize: "14px", color: "#FFFFFF" },
                }}
                InputLabelProps={{
                  sx: {
                    fontFamily: "Inter",
                    fontSize: "12px",
                    color: "#929292",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#1F1F1F",
                    borderRadius: "10px",
                    "& fieldset": { borderColor: "#2A2A2A" },
                    "&:hover fieldset": { borderColor: "#3A3A3A" },
                    "&.Mui-focused fieldset": { borderColor: "#E50914" },
                  },
                }}
              />
            </Box>

            <Box sx={{ mt: 2.5 }}>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#929292",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CalendarRange size={15} color="#929292" />
                Billing Interval
              </Typography>

              {key === "free" ? (
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "13px",
                    color: "#6B6B6B",
                  }}
                >
                  Not applicable — the Free plan has no billing interval.
                </Typography>
              ) : (
                <ToggleButtonGroup
                  value={interval}
                  exclusive
                  onChange={(_e, value) => value && setInterval(value)}
                  sx={{
                    "& .MuiToggleButton-root": {
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#929292",
                      textTransform: "none",
                      borderColor: "#2A2A2A",
                      bgcolor: "#1F1F1F",
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      "&.Mui-selected": {
                        bgcolor: "#1A0002",
                        color: "#FFFFFF",
                        borderColor: "#E50914",
                      },
                      "&:hover": { bgcolor: "#242424" },
                    },
                  }}
                >
                  <ToggleButton value="month">Monthly</ToggleButton>
                  <ToggleButton value="year">Annually</ToggleButton>
                </ToggleButtonGroup>
              )}
            </Box>
          </Box>

          {/* Benefits */}
          <Box
            sx={{
              bgcolor: "#161616",
              border: "1px solid #1F1F1F",
              borderRadius: "10px",
              boxShadow: "0px 4px 20px #00000066",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
              <ListChecks size={18} color="#E50914" />
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "16px",
                  color: "#FFFFFF",
                }}
              >
                Benefits
              </Typography>

              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "11px",
                  color: "#6B6B6B",
                  ml: "auto",
                }}
              >
                {benefits.filter((b) => b.enabled).length}/{benefits.length} enabled
              </Typography>
            </Box>

            {benefits.length === 0 ? (
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
                No benefits found
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {benefits.map((benefit, i) => (
                  <Box
                    key={i}
                    sx={{
                      bgcolor: "#1F1F1F",
                      border: "1px solid #2A2A2A",
                      borderRadius: "10px",
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      opacity: benefit.enabled ? 1 : 0.45,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: benefit.enabled ? "#E50914" : "#3A3A3A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {benefit.enabled ? (
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      ) : (
                        <Ban size={11} color="#FFFFFF" />
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#FFFFFF",
                        flex: 1,
                      }}
                    >
                      {benefit.text}
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={benefit.enabled}
                          onChange={() => toggleBenefit(i)}
                          size="small"
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#E50914",
                              "&:hover": { bgcolor: "rgba(229,9,20,0.1)" },
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              bgcolor: "#E50914",
                            },
                          }}
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: "#1F1F1F" }} />

          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "12px",
              color: "#6B6B6B",
            }}
          >
            Changes are saved to the database and picked up live by the app's
            pricing screen and checkout.
          </Typography>
        </Box>
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
            bgcolor: snackbar.severity === "success" ? "#1B5E20" : "#B71C1C",
            fontFamily: "Inter",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
