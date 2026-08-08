import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ContentLibrary from "./pages/ContentLibrary";
import ProgramsCategories from "./pages/ProgramsCategories";
import ProgramDetails from "./pages/ProgramDetails";
import DashboardLayout from "./layouts/DashboardLayout";
import DrillDetails from "./pages/DrillDetails";
import CoachDetails from "./pages/CoachDetails";
import LearnFromThePros from "./pages/LearnFromThePros";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Podcast from "./pages/Podcast";
import PodcastDetails from "./pages/PodcastDetails";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("admin-token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content" element={<ContentLibrary />} />
          <Route path="/programs" element={<ProgramsCategories />} />
          <Route path="/program/:id" element={<ProgramDetails />} />
          <Route path="/drill/:id" element={<DrillDetails />} />
          <Route path="/coach/:id" element={<CoachDetails />} />
          <Route path="/pros" element={<LearnFromThePros />} />
          <Route path="/users" element={<Users />} />
          <Route path="/user/:id" element={<UserDetails />} />
          <Route path="/podcasts" element={<Podcast />} />
          <Route path="/podcast/:id" element={<PodcastDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
