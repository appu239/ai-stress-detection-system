import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="py-12 text-center text-[13px] text-gray-400 bg-white border-t border-gray-100">
      <div className="flex justify-center gap-8 mb-6 font-medium text-gray-500">
        <Link to="/help" className="hover:text-primary transition-colors">
          Help Center
        </Link>
        <Link to="/security" className="hover:text-primary transition-colors">
          Security
        </Link>
        <Link to="/faq" className="hover:text-primary transition-colors">
          Enterprise FAQ
        </Link>
      </div>
      <p>© 2024 StressAI Enterprise Wellness. All rights reserved.</p>
    </footer>
  );
}