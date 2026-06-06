import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Planner() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-8">
      <h1 className="text-3xl font-bold mb-2">AI Travel Planner ✈️</h1>
      <p className="text-gray-400 mb-6">
        Welcome, <span className="text-white font-medium">{user?.name}</span>!
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Phase 1 complete — travel planning UI coming in Phase 2.
      </p>
      <button
        onClick={handleLogout}
        className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition"
      >
        Sign out
      </button>
    </div>
  );
}