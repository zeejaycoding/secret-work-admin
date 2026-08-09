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
import Subscriptions from "./pages/Subscriptions";
import PlanDetail from "./pages/PlanDetail";
import Analytics from "./pages/Analytics";
import EditPlan from "./pages/EditPlan";
import Podcast from "./pages/Podcast";
import PodcastDetails from "./pages/PodcastDetails";
import Notifications from "./pages/Notifications";
import RolesPermissions from "./pages/RolesPermissions";
import RoleDetail from "./pages/RoleDetail";
import Settings from "./pages/Settings";
import BrandEditor from "./pages/BrandEditor";

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
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/plan/:key" element={<PlanDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/plan/:key/edit" element={<EditPlan />} />
          <Route path="/podcasts" element={<Podcast />} />
          <Route path="/podcast/:id" element={<PodcastDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/roles" element={<RolesPermissions />} />
          <Route path="/role/:key" element={<RoleDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/brand-editor" element={<BrandEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
