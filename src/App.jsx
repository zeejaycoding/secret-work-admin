import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ContentLibrary from "./pages/ContentLibrary";
import DashboardLayout from "./layouts/DashboardLayout";
import DrillDetails from "./pages/DrillDetails";

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
          <Route path="/drill/:id" element={<DrillDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
