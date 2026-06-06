import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import client from "../api/client";
import useAuthStore from "../store/authStore";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setServerError("");
    try {
      const res = await client.post("/api/auth/login", data);
      const { user, accessToken, refreshToken } = res.data;

      // Store refresh token separately (not in Zustand)
      const stored = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem(
        "auth",
        JSON.stringify({ ...stored, refreshToken })
      );

      setAuth(user, accessToken);
      navigate("/planner", { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.error || "Login failed. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Sign in</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Welcome back to AI Travel Planner
        </p>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}