import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Divider, useMediaQuery, useTheme, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { adminLogout } from "../services/api";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Files,
  Layers3,
  GraduationCap,
  Podcast,
  Users,
  CreditCard,
  ChartColumn,
  BellDot,
  MessageSquare,
  ShieldCheck,
  Settings,
} from "lucide-react";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(isMobile);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  const activeSx = collapsed
    ? { bgcolor: "#242424" }
    : {
        bgcolor: "#242424",
        border: "1px solid #2A2A2A",
        boxShadow: "0px 4px 20px #00000040, inset 0px 1px 1px #8A848440",
      };

  const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Content Library",
    icon: Files,
    path: "/content",
  },
  {
    title: "Programs & Categories",
    icon: Layers3,
    path: "/programs",
  },
  {
    title: "Learn from the Pros",
    icon: GraduationCap,
    path: "/pros",
  },
  {
    title: "Podcasts",
    icon: Podcast,
    path: "/podcasts",
  },

];

const peopleItems = [
  {
    title: "Users",
    icon: Users,
    path: "/users",
  },
  {
    title: "Subscriptions",
    icon: CreditCard,
    path: "/subscriptions",
  },
  {
    title: "Support Queries",
    icon: MessageSquare,
    path: "/support",
  },
];

const insightItems = [
  {
    title: "Analytics",
    icon: ChartColumn,
    path: "/analytics",
  },
  {
    title: "Notifications",
    icon: BellDot,
    path: "/notifications",
  },
];

const systemItems = [
  {
    title: "Roles & Permissions",
    icon: ShieldCheck,
    path: "/roles",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

  return (
  <>
  {!collapsed && isMobile && (
    <Box
      onClick={() => setCollapsed(true)}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        bgcolor: "rgba(0,0,0,0.5)",
      }}
    />
  )}
  <Box
  sx={{
    width: collapsed ? { xs: 56, md: 104 } : { xs: 280, md: 280 },
    flexShrink: 0,
    minHeight: "100vh",
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "column",
    bgcolor: "#000",
    borderRight: "1px solid #1F1F1F",
    transition: "width .3s ease",
    position: { xs: collapsed ? "relative" : "fixed", md: "relative" },
    zIndex: { xs: collapsed ? 1 : 1300, md: 1 },
    left: 0,
    top: 0,
  }}
>
  
     <Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: collapsed ? 1.5 : 2.5,
    py: 3,
  }}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      overflow: "hidden",
    }}
  >
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{
        width: 56,
        height: 56,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />

    {!collapsed && (
      <Typography
        sx={{
          fontFamily: "Inter",
          fontWeight: 600,
          fontSize: "16px",
          color: "#fff",
          whiteSpace: "nowrap",
        }}
      >
        Secret Work
      </Typography>
    )}
  </Box>

  <IconButton
    onClick={() => setCollapsed(!collapsed)}
    sx={{
      color: "#fff",
      flexShrink: 0,
      ml: collapsed ? 0 : 1,
    }}
  >
    {collapsed ? (
      <PanelLeftOpen size={20} />
    ) : (
      <PanelLeftClose size={20} />
    )}
  </IconButton>
</Box>

      <Divider
        sx={{
          borderColor: "#1F1F1F",
        }}
      />

 <Box
  sx={{
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    px: 2,
    py: 2.5,

    /* Hide scrollbar but keep scrolling */
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  }}
>

  {!collapsed && (
    <Typography
      sx={{
        fontFamily: "Inter",
        fontWeight: 600,
        fontSize: "10px",
        color: "#4A4949",
        mb: 2,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      Manage
    </Typography>
  )}

  {menuItems.map((item) => {
    const Icon = item.icon;
    const isActive = item.path && location.pathname === item.path;

    return (
     <Box
  key={item.title}
  onClick={() => item.path && navigate(item.path)}
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    px: 1,
    py: 1.4,
    borderRadius: "10px",
    cursor: "pointer",
    justifyContent: "flex-start",
    transition: "all .2s",
    border: "1px solid transparent",
    ...(isActive ? activeSx : {}),

    "&:hover": {
      bgcolor: isActive ? "#242424" : "#111111",
    },
  }}
>
  <Icon
    size={20}
    color={isActive ? "#FFFFFF" : "#929292"}
    style={{ minWidth: 20 }}
  />

  {!collapsed && (
    <Typography
      sx={{
        fontFamily: "Poppins",
        fontWeight: 500,
        fontSize: "13px",
        color: isActive ? "#FFFFFF" : "#929292",
        whiteSpace: "nowrap",
      }}
    >
      {item.title}
    </Typography>
  )}
</Box>
    );
  })}

  <Divider
  sx={{
    borderColor: "#161616",
    my: 2,
  }}
/>

{!collapsed && (
  <Typography
    sx={{
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: "14px",
      color: "#4A4949",
      mb: 2,
    }}
  >
    People
  </Typography>
)}

{peopleItems.map((item) => {
  const Icon = item.icon;
  const isActive = item.path && location.pathname === item.path;

  return (
    <Box
      key={item.title}
      onClick={() => item.path && navigate(item.path)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1,
        py: 1.4,
        borderRadius: "10px",
        cursor: item.path ? "pointer" : "default",
        justifyContent: "flex-start",
        transition: "all .2s",
        border: "1px solid transparent",
        ...(isActive ? activeSx : {}),

        "&:hover": {
          bgcolor: isActive ? "#242424" : "#111111",
        },
      }}
    >
      <Icon
        size={20}
        color={isActive ? "#FFFFFF" : "#929292"}
        style={{ minWidth: 20 }}
      />

      {!collapsed && (
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: isActive ? "#FFFFFF" : "#929292",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </Typography>
      )}
    </Box>
  );
})}
<Divider
  sx={{
    borderColor: "#161616",
    my: 2,
  }}
/>

{!collapsed && (
  <Typography
    sx={{
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: "14px",
      color: "#4A4949",
      mb: 2,
    }}
  >
    Insights
  </Typography>
)}

{insightItems.map((item) => {
  const Icon = item.icon;
  const isActive = item.path && location.pathname === item.path;

  return (
    <Box
      key={item.title}
      onClick={() => item.path && navigate(item.path)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1,
        py: 1.4,
        borderRadius: "10px",
        cursor: item.path ? "pointer" : "default",
        transition: "all .2s",
        border: "1px solid transparent",
        ...(isActive ? activeSx : {}),

        "&:hover": {
          bgcolor: isActive ? "#242424" : "#111111",
        },
      }}
    >
      <Icon
        size={20}
        color={isActive ? "#FFFFFF" : "#929292"}
        style={{ minWidth: 20 }}
      />

      {!collapsed && (
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: isActive ? "#FFFFFF" : "#929292",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </Typography>
      )}
    </Box>
  );
})}


<Divider
  sx={{
    borderColor: "#161616",
    my: 2,
  }}
/>

{!collapsed && (
  <Typography
    sx={{
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: "14px",
      color: "#4A4949",
      mb: 2,
    }}
  >
    Systems
  </Typography>
)}

{systemItems.map((item) => {
  const Icon = item.icon;
  const isActive = item.path && location.pathname === item.path;

  return (
    <Box
      key={item.title}
      onClick={() => item.path && navigate(item.path)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1,
        py: 1.4,
        borderRadius: "10px",
        cursor: item.path ? "pointer" : "default",
        transition: "all .2s",
        border: "1px solid transparent",
        ...(isActive ? activeSx : {}),

        "&:hover": {
          bgcolor: isActive ? "#242424" : "#111111",
        },
      }}
    >
      <Icon
        size={20}
        color={isActive ? "#FFFFFF" : "#929292"}
        style={{ minWidth: 20 }}
      />

      {!collapsed && (
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: isActive ? "#FFFFFF" : "#929292",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </Typography>
      )}

      
    </Box>


  );
})}
<Box sx={{ py: 2 }}>
  <Button
    onClick={() => {
      try {
        adminLogout();
      } catch {
        localStorage.removeItem("admin-token");
        window.location.href = "/";
      }
    }}
    sx={{
      width: "100%",
      justifyContent: "flex-start",
      textTransform: "none",
      color: "#FFFFFF",
      borderRadius: "10px",
      px: 1,
    }}
    startIcon={<ExitToAppIcon style={{ color: "#FFFFFF" }} />}
  >
    Logout
  </Button>
</Box>

</Box>

    </Box>
  </>
  );
}