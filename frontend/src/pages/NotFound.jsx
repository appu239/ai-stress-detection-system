import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0e14] text-slate-100 p-4">
            <h1 className="text-9xl font-black text-slate-800">404</h1>
            <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
            <p className="text-slate-400 mt-2 text-center max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="mt-8 px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                Go to Home
            </Link>
        </div>
    );
}
