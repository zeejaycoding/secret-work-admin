import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Settings,
  Bell,
  CreditCard,
  Plug,
  HardDrive,
  CheckCircle2,
  Save,
} from "lucide-react";
import { getSettings, updateSettings } from "../services/api";

const TABS = [
  { key: "branding", label: "Branding" },
  { key: "notifications", label: "Notifications" },
  { key: "payments", label: "Payments" },
  { key: "integrations", label: "Integrations" },
  { key: "storage", label: "Storage" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#1F1F1F",
    borderRadius: "10px",
    "& fieldset": { borderColor: "#2A2A2A" },
    "&:hover fieldset": { borderColor: "#3A3A3A" },
    "&.Mui-focused fieldset": { borderColor: "#E50914" },
  },
  "& input::placeholder": {
    color: "#5A5A5A",
    opacity: 1,
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: "14px",
  },
};

const cardSx = {
  bgcolor: "#161616",
  border: "1px solid #1F1F1F",
  borderRadius: "10px",
  boxShadow: "0px 4px 20px #00000066",
  p: 3,
};

const sectionTitleSx = {
  fontFamily: "Poppins",
  fontWeight: 500,
  fontSize: "15px",
  color: "#FFFFFF",
  mb: 0.5,
};

const sectionSubSx = {
  fontFamily: "Poppins",
  fontWeight: 500,
  fontSize: "12px",
  color: "#6B6B6B",
  mb: 3,
};

const inputLabelSx = {
  fontFamily: "Inter",
  fontWeight: 500,
  fontSize: "12px",
  color: "#929292",
  mb: 1,
};

const saveBtnSx = {
  bgcolor: "#E50914",
  borderRadius: "10px",
  color: "#FFFFFF",
  textTransform: "none",
  fontFamily: "Poppins",
  fontWeight: 500,
  fontSize: "13px",
  px: 3,
  py: 1.2,
  "&:hover": {
    bgcolor: "#C40812",
  },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("branding");
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState("Settings saved");

  // Branding
  const [appName, setAppName] = useState("Secret Work");
  const [tagline, setTagline] = useState("Train like the pros");

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({
    push: true,
    email: true,
    inApp: true,
    insights: true,
    failed: true,
    reports: true,
  });

  // Payments
  const [currency, setCurrency] = useState("USD");
  const [integrationsState, setIntegrationsState] = useState({});

  useEffect(() => {
    let mounted = true;
    getSettings()
      .then((res) => {
        if (!mounted) return;
        const { branding, notifications, integrations, storage, payments } = res.data;
        if (branding) {
          if (branding.appName) setAppName(branding.appName);
          if (branding.tagline != null) setTagline(branding.tagline);
        }
        if (notifications) {
          setNotifPrefs((prev) => ({
            ...prev,
            ...notifications,
          }));
        }
        if (payments && payments.currency) setCurrency(payments.currency);
        if (integrations) setIntegrationsState(integrations);
      })
      .catch((error) => {
        console.error("Failed to load settings:", error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      updateSettings({ notifications: next })
        .then(() => {
          setSavedMsg("Notification preferences saved");
          setSaved(true);
        })
        .catch((error) => {
          console.error("Failed to save notification preferences:", error);
        });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        branding: { appName, tagline },
        notifications: notifPrefs,
      });
      setSavedMsg("Settings saved");
      setSaved(true);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSavedMsg("Failed to save settings");
      setSaved(true);
    }
  };

  const brandPalette = [
    { name: "Primary Red", hex: "#E50914" },
    { name: "Accent Red", hex: "#FF0015" },
    { name: "Card Dark", hex: "#111111" },
    { name: "Deep Black", hex: "#0A0A0A" },
    { name: "Text White", hex: "#FFFFFF" },
    { name: "Text Muted", hex: "#929292" },
  ];

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <Settings size={20} color="#929292" />
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Settings
        </Typography>
      </Box>

      {/* Heading */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "18px", sm: "20px", md: "24px" },
            color: "#FFFFFF",
            mb: 0.5,
          }}
        >
          Settings
        </Typography>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: { xs: "12px", md: "13px" },
            color: "#6B6B6B",
          }}
        >
          Manage branding, notifications, payments, integrations and storage.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 4 }}>
        {TABS.map((tab) => {
          // const Icon = tab.icon;
          const isActive = tab.key === activeTab;

          return (
            <Box
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2.5,
                py: 1.4,
                borderRadius: "10px",
                cursor: "pointer",
                bgcolor: "#1A1A1A",
                border: isActive ? "1px solid #FFFFFF" : "1px solid transparent",
                transition: "all .2s",
                "&:hover": {
                  bgcolor: "#222222",
                },
              }}
            >
              {/* <Icon size={18} color={isActive ? "#929292" : "#FFFFFF"} /> */}
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "13px",
                  color: isActive ? "#929292" : "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ── Branding ── */}
      {activeTab === "branding" && (
        <Box sx={cardSx}>
          <Typography sx={sectionTitleSx}>Brand</Typography>
          <Typography sx={sectionSubSx}>
            Name, tagline and the app's current color palette.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              mb: 4,
            }}
          >
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 200 } }}>
              <Typography sx={inputLabelSx}>Platform name</Typography>
              <TextField
                fullWidth
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                sx={fieldSx}
                inputProps={{
                  style: { color: "#FFFFFF", fontFamily: "Inter", fontWeight: 500 },
                }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 200 } }}>
              <Typography sx={inputLabelSx}>Tagline</Typography>
              <TextField
                fullWidth
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                sx={fieldSx}
                inputProps={{
                  style: { color: "#FFFFFF", fontFamily: "Inter", fontWeight: 500 },
                }}
              />
            </Box>
          </Box>

          {/* Color palette */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={sectionTitleSx}>Color palette</Typography>
            <Typography sx={sectionSubSx}>
              Current primary colors of the app.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {brandPalette.map((c) => (
                <Box
                  key={c.hex}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "8px",
                    bgcolor: c.hex,
                    border: "1px solid #2A2A2A",
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button onClick={handleSave} sx={saveBtnSx}>
              Save
            </Button>
            <Button
              onClick={() => navigate("/settings/brand-editor")}
              sx={{
                borderColor: "#2A2A2A",
                borderRadius: "10px",
                color: "#FFFFFF",
                backgroundColor: "#2A2A2A",
                textTransform: "none",
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                px: 3,
                py: 1.2,
                "&:hover": {
                  borderColor: "#3A3A3A",
                  bgcolor: "#1F1F1F",
                },
              }}
            >
              Open brand editor
            </Button>
          </Box>
        </Box>
      )}

      {/* ── Notifications ── */}
      {activeTab === "notifications" && (
        <Box sx={cardSx}>
          <Typography sx={sectionTitleSx}>Notification preferences</Typography>
          <Box>
            {[
              { key: "push", title: "Push notifications" },
              { key: "email", title: "Email Digest"},
              { key: "inApp", title: "In-app notifications" },
              { key: "insights", title: "Weekly Insights" },
              { key: "failed", title: "Failed Payment alerts" },
              { key: "reports", title: "New Report alerts" },
            ].map((item, i) => (
              <Box key={item.key}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "#FFFFFF",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "11.5px",
                        color: "#6B6B6B",
                        mt: 0.3,
                      }}
                    >
                      {item.sub}
                    </Typography>
                  </Box>

                  <Switch
                    checked={notifPrefs[item.key]}
                    onChange={() => toggleNotif(item.key)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#E50914",
                        "& + .MuiSwitch-track": {
                          backgroundColor: "#E50914",
                        },
                      },
                      "& .MuiSwitch-track": {
                        backgroundColor: "#2A2A2A",
                      },
                    }}
                  />
                </Box>

                {i < 2 && <Divider sx={{ borderColor: "#1E1E1E" }} />}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Payments ── */}
      {activeTab === "payments" && (
        <Box sx={cardSx}>
          <Typography sx={sectionTitleSx}>Payments</Typography>
          <Typography sx={sectionSubSx}>
            Configure payment processing and billing settings.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#1F1F1F",
                border: "1px solid #2A2A2A",
                borderRadius: "10px",
                p: 2.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#FFFFFF",
                  }}
                >
                  Stripe
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "11.5px",
                    color: "#6B6B6B",
                    mt: 0.3,
                  }}
                >
                  Subscriptions and checkout
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle2 size={16} color="#4CAF50" />
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "12px",
                    color: "#4CAF50",
                  }}
                >
                  Connected
                </Typography>
              </Box>
            </Box>

          </Box>
        </Box>
      )}

      {/* ── Integrations ── */}
      {activeTab === "integrations" && (
        <Box sx={cardSx}>
          <Typography sx={sectionTitleSx}>Integrations</Typography>
          <Typography sx={sectionSubSx}>
            Third-party services connected to your app.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { name: "SendGrid", desc: "Transactional and campaign emails", key: "sendgrid" },
              { name: "Expo Push", desc: "Push notifications", key: "expo" },
              { name: "Clerk", desc: "Authentication", key: "clerk" },
              { name: "Cloudinary", desc: "Media storage and delivery", key: "cloudinary" },
              { name: "OpenAI", desc: "Podcast transcription", key: "openai" },
            ].map((item, i) => (
              <Box key={item.name}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "#FFFFFF",
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "11.5px",
                        color: "#6B6B6B",
                        mt: 0.3,
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {integrationsState[item.key] ? (
                      <>
                        <CheckCircle2 size={16} color="#4CAF50" />
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "12px",
                            color: "#4CAF50",
                          }}
                        >
                          Connected
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontWeight: 500,
                            fontSize: "12px",
                            color: "#929292",
                          }}
                        >
                          Disconnected
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                {i < 4 && <Divider sx={{ borderColor: "#1E1E1E" }} />}
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: "#1E1E1E", my: 3 }} />

          {/* Transcription */}
          <Typography sx={sectionTitleSx}>Podcast transcription</Typography>
          <Typography sx={sectionSubSx}>
            Transcripts are generated with OpenAI's whisper-1 model, which
            returns per-segment timestamps.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#1F1F1F",
              border: "1px solid #2A2A2A",
              borderRadius: "10px",
              p: 2.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#FFFFFF",
                }}
              >
                Transcription model
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "11.5px",
                  color: "#6B6B6B",
                  mt: 0.3,
                }}
              >
                Runs in the background; the episode page polls until done.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircle2 size={16} color="#4CAF50" />
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#4CAF50",
                }}
              >
                whisper-1
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Storage ── */}
      {activeTab === "storage" && (
        <Box sx={cardSx}>
          <Typography sx={sectionTitleSx}>Storage</Typography>
          <Typography sx={sectionSubSx}>
            Media stored and delivered through Cloudinary.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#1F1F1F",
              border: "1px solid #2A2A2A",
              borderRadius: "10px",
              p: 2.5,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#FFFFFF",
                }}
              >
                Cloudinary
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "11.5px",
                  color: "#6B6B6B",
                  mt: 0.3,
                }}
              >
                Drills, podcasts and images
              </Typography>
            </Box>

            <Typography
              sx={{
                fontFamily: "Poppins",
                fontWeight: 500,
                fontSize: "13px",
                color: "#929292",
              }}
            >
              1.2 GB / 10 GB
            </Typography>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                height: 8,
                bgcolor: "#2A2A2A",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <Box sx={{ width: "12%", height: "100%", bgcolor: "#E50914" }} />
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSaved(false)}
          severity="success"
          variant="filled"
          sx={{ bgcolor: "#1B3A1F", color: "#4CAF50", fontFamily: "Poppins" }}
        >
          {savedMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
