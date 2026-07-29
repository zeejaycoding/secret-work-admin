import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <Box
  sx={{
    display: "flex",
    width: "100%",
    alignItems: "stretch",
  }}
>
  <Sidebar />

  <Box
    component="main"
    sx={{
      flex: 1,
      minWidth: 0,
      bgcolor: "#121212",
      p: { xs: 2, sm: 3, md: 4 },
    }}
  >
    <Outlet />
  </Box>
</Box>
  );
}