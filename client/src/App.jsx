import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Planner from "./pages/Planner";
import History from "./pages/History";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/planner"
          element={
            <ProtectedRoute>
              <Planner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}