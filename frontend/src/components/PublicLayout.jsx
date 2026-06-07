import { useNavigate } from "react-router-dom";
import PublicFooter from "./PublicFooter";

export default function PublicLayout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

          <h1
            onClick={() => navigate("/")}
            className="text-xl font-bold cursor-pointer text-primary"
          >
            StressAI
          </h1>

          <div className="flex gap-6 text-sm font-medium">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/demo")}>Demo</button>
            <button onClick={() => navigate("/help")}>Help</button>
            <button onClick={() => navigate("/contact")}>Contact</button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 border rounded-lg"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Get Started
            </button>
          </div>

        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}