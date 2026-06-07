import { Outlet, useLocation } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import AdminSidebar from "../components/AdminSidebar";
import { getUserRole } from "../utils/auth";

export default function DashboardLayout() {
  const role = getUserRole()?.toUpperCase();
  const location = useLocation();

  const isLightThemePage =
    location.pathname === "/admin/users" ||
    location.pathname === "/admin/audit-logs";

  const getBgClass = () => {
    if (role !== 'ADMIN') return 'bg-[#f8fafc] dark:bg-[#0f172a]';
    if (isLightThemePage) return 'bg-[#fcfdfe]'; // Ultra-clean light background
    return 'bg-gradient-to-br from-[#0f172a] to-[#0b1220]'; // Premium dark gradient
  };

  return (
    <div className={`flex min-h-screen ${getBgClass()} transition-colors duration-500 overflow-x-hidden`}>
      {/* SIDEBAR */}
      {role === "ADMIN" ? <AdminSidebar /> : <UserSidebar />}

      {/* PAGE CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className={`${role === 'ADMIN' ? 'p-8' : 'max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
