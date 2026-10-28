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

/* =========================
   PROTECTED USER ROUTE
========================= */
function UserProtectedRoute({ children }) {
  const token = getAuthToken();
  const role = getUserRole();

  if (!token || String(role || "").toUpperCase() !== "USER") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   PROTECTED ADMIN ROUTE
========================= */
function AdminProtectedRoute({ children }) {
  const token = getAuthToken();
  const role = getUserRole();

  if (!token || String(role || "").toUpperCase() !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   MAIN APP
========================= */
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>

            {/* ================= PUBLIC ROUTES ================= */}

            <Route path="/" element={<Landing />} />

            <Route path="/login" element={<UserLogin />} />

            <Route path="/register" element={<UserRegister />} />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route path="/help" element={<HelpCenter />} />

            <Route path="/security" element={<Security />} />

            <Route path="/faq" element={<FAQ />} />

            <Route path="/demo" element={<Demo />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/pricing" element={<Pricing />} />


            {/* ================= USER DASHBOARD ================= */}

            <Route
              path="/user"
              element={
                <UserProtectedRoute>
                  <DashboardLayout />
                </UserProtectedRoute>
              }
            >
              {/* /user → /user/analyze */}
              <Route
                index
                element={
                  <Navigate
                    to="/user/analyze"
                    replace
                  />
                }
              />

              {/* Analyze */}
              <Route
                path="analyze"
                element={<Analyze />}
              />

              {/* History */}
              <Route
                path="history"
                element={<History />}
              />

              {/* Settings */}
              <Route
                path="settings"
                element={<Settings />}
              />
            </Route>


            {/* ================= ADMIN DASHBOARD ================= */}

            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <DashboardLayout />
                </AdminProtectedRoute>
              }
            >
              {/* /admin → /admin/dashboard */}
              <Route
                index
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="dashboard"
                element={<AdminDashboard />}
              />

              {/* Admin Analytics */}
              <Route
                path="analytics"
                element={<AdminAnalytics />}
              />

              {/* User Management */}
              <Route
                path="users"
                element={<AdminUserManagement />}
              />

              {/* Individual User Details */}
              <Route
                path="users/:userId"
                element={<AdminUserDetails />}
              />

              {/* Audit Logs */}
              <Route
                path="audit-logs"
                element={<AdminAuditLogs />}
              />
            </Route>


            {/* ================= 404 ================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </ThemeProvider>
  );
}