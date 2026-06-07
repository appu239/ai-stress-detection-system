import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HelpCenter from "./pages/HelpCenter";
import Security from "./pages/Security";
import FAQ from "./pages/FAQ";
import Demo from "./pages/Demo";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
import DashboardLayout from "./layouts/DashboardLayout";

/* PUBLIC */
import Landing from "./pages/Landing";

/* AUTH */
import UserLogin from "./auth/UserLogin";
import UserRegister from "./auth/UserRegister";
import ForgotPassword from "./auth/ForgotPassword";

/* USER */
import Analyze from "./user/Analyze";
import History from "./user/History";
import Settings from "./user/Settings";

/* ADMIN */
import AdminDashboard from "./admin/AdminDashboard";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminUserManagement from "./admin/AdminUserManagement";
import AdminUserDetails from "./admin/AdminUserDetails";
import AdminAuditLogs from "./admin/AdminAuditLogs";
import NotFound from "./pages/NotFound";

/* AUTH UTILS */
import { getAuthToken, getUserRole } from "./utils/auth";

/* PROTECTED ROUTES */
function UserProtectedRoute({ children }) {
  const token = getAuthToken();
  const role = getUserRole();
  if (!token || role?.toUpperCase() !== "USER") return <Navigate to="/login" replace />;
  return children;
}

function AdminProtectedRoute({ children }) {
  const token = getAuthToken();
  const role = getUserRole();
  if (!token || role?.toUpperCase() !== "ADMIN") return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/security" element={<Security />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* USER DASHBOARD ROUTES */}
            <Route path="/user" element={
              <UserProtectedRoute>
                <DashboardLayout />
              </UserProtectedRoute>
            }>
              <Route index element={<Navigate to="/user/analyze" replace />} />
              <Route path="analyze" element={<Analyze />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* ADMIN DASHBOARD ROUTES */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <DashboardLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="users/:userId" element={<AdminUserDetails />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  );
}