import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  ArrowLeft,
  Save,
  ImageUp,
} from "lucide-react";
import { getSettings, updateSettings } from "../services/api";

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

const inputLabelSx = {
  fontFamily: "Inter",
  fontWeight: 500,
  fontSize: "12px",
  color: "#929292",
  mb: 1,
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

const FONTS = ["Poppins", "Inter", "Roboto", "Montserrat", "Lato", "Playfair Display"];

function UploadBox({ label, sub }) {
  return (
    <Box
      sx={{
        bgcolor: "#1F1F1F",
        border: "1px dashed #3A3A3A",
        borderRadius: "10px",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        minHeight: 150,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "10px",
          bgcolor: "#2A2A2A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ImageUp size={20} color="#929292" />
      </Box>

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

      <Typography
        sx={{
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: "11px",
          color: "#6B6B6B",
          textAlign: "center",
        }}
      >
        {sub}
      </Typography>

      <Button
        variant="outlined"
        sx={{
          borderColor: "#2A2A2A",
          borderRadius: "10px",
          color: "#D6D6D6",
          textTransform: "none",
          fontFamily: "Poppins",
          fontWeight: 500,
          fontSize: "12px",
          mt: 1,
          "&:hover": {
            borderColor: "#3A3A3A",
            bgcolor: "#2A2A2A",
          },
        }}
      >
        Upload
      </Button>
    </Box>
  );
}

export default function BrandEditorPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState("Brand settings saved");

  const [appName, setAppName] = useState("Secret Work");
  const [tagline, setTagline] = useState("Train like the pros");

  const [primaryColor, setPrimaryColor] = useState("#E50914");
  const [accentColor, setAccentColor] = useState("#FF0015");
  const [displayFont, setDisplayFont] = useState("Poppins");
  const [bodyFont, setBodyFont] = useState("Inter");

  useEffect(() => {
    let mounted = true;
    getSettings()
      .then((res) => {
        if (!mounted) return;
        const { branding } = res.data;
        if (!branding) return;
        if (branding.appName) setAppName(branding.appName);
        if (branding.tagline != null) setTagline(branding.tagline);
        if (branding.primaryColor) setPrimaryColor(branding.primaryColor);
        if (branding.accentColor) setAccentColor(branding.accentColor);
        if (branding.displayFont) setDisplayFont(branding.displayFont);
        if (branding.bodyFont) setBodyFont(branding.bodyFont);
      })
      .catch((error) => {
        console.error("Failed to load branding:", error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings({
        branding: {
          appName,
          tagline,
          primaryColor,
          accentColor,
          displayFont,
          bodyFont,
        },
      });
      setSavedMsg("Brand settings saved");
      setSaved(true);
    } catch (error) {
      console.error("Failed to save branding:", error);
      setSavedMsg("Failed to save brand settings");
      setSaved(true);
    }
  };

  const colorField = (label, value, onChange) => (
    <Box>
      <Typography sx={inputLabelSx}>{label}</Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "#1F1F1F",
          border: "1px solid #2A2A2A",
          borderRadius: "10px",
          p: 1,
          pl: 1.5,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "8px",
            bgcolor: value,
            border: "1px solid #3A3A3A",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              padding: 0,
              background: "transparent",
              cursor: "pointer",
              opacity: 0,
            }}
          />
        </Box>
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "13px",
            color: "#FFFFFF",
          }}
        >
          {value.toUpperCase()}
        </Typography>
      </Box>
    </Box>
  );

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
        onClick={() => navigate("/settings")}
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
          Settings
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
          Brand Editor
        </Typography>
      </Box>

      {/* Heading + Save buttons on the right */}
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
              fontSize: { xs: "18px", sm: "20px", md: "24px" },
              color: "#FFFFFF",
              mb: 0.5,
            }}
          >
            Brand Editor
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "12px", md: "13px" },
              color: "#6B6B6B",
            }}
          >
            Logo, colors, typography and app icon.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexShrink: 0 }}>
          <Button
            onClick={() => navigate("/settings")}
            sx={{
              borderColor: "#2A2A2A",
              borderRadius: "10px",
              color: "#D6D6D6",
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
            Cancel
          </Button>

          <Button
            startIcon={<Save size={16} />}
            onClick={handleSave}
            sx={{
              bgcolor: "#E50914",
              borderRadius: "10px",
              color: "#FFFFFF",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "13px",
              px: 3,
              py: 1.2,
              boxShadow: "0px 4px 15px #F81B1B40",
              "&:hover": {
                bgcolor: "#C40812",
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "10px",
          boxShadow: "0px 4px 20px #00000066",
          p: 3,
        }}
      >
        
        {/* 50/50 boxes */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {/* Left: assets */}
          <Box
            sx={{
              bgcolor: "#1F1F1F",
              border: "1px solid #2A2A2A",
              borderRadius: "10px",
              p: 3,
            }}
          >
            <Typography sx={sectionTitleSx}>Brand assets</Typography>
            <Typography sx={sectionSubSx}>
              Logo and app icon used across the platform.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <UploadBox label="Upload logo" sub="PNG, JPG or SVG · 512×512" />
              <UploadBox label="Upload app icon" sub="PNG · 1024×1024" />
            </Box>
          </Box>

          {/* Right: colors & typography */}
          <Box
            sx={{
              bgcolor: "#1F1F1F",
              border: "1px solid #2A2A2A",
              borderRadius: "10px",
              p: 3,
            }}
          >
            <Typography sx={sectionTitleSx}>Colors &amp; typography</Typography>
            <Typography sx={sectionSubSx}>
              Primary colors and fonts used across the app.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {colorField("Primary color", primaryColor, setPrimaryColor)}
              {colorField("Accent color", accentColor, setAccentColor)}

              <Box>
                <Typography sx={inputLabelSx}>Display font</Typography>
                <TextField
                  fullWidth
                  select
                  value={displayFont}
                  onChange={(e) => setDisplayFont(e.target.value)}
                  sx={fieldSx}
                  SelectProps={{
                    style: {
                      color: "#FFFFFF",
                      fontFamily: "Poppins",
                      fontWeight: 500,
                    },
                  }}
                >
                  {FONTS.map((f) => (
                    <MenuItem
                      key={f}
                      value={f}
                      sx={{
                        fontFamily: "Poppins",
                        fontSize: "14px",
                      }}
                    >
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography sx={inputLabelSx}>Body font</Typography>
                <TextField
                  fullWidth
                  select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  sx={fieldSx}
                  SelectProps={{
                    style: {
                      color: "#FFFFFF",
                      fontFamily: "Inter",
                      fontWeight: 500,
                    },
                  }}
                >
                  {FONTS.map((f) => (
                    <MenuItem
                      key={f}
                      value={f}
                      sx={{
                        fontFamily: "Poppins",
                        fontSize: "14px",
                      }}
                    >
                      {f}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

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
