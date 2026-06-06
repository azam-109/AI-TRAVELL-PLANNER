import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach Bearer token ──────────────────────────────────
client.interceptors.request.use((config) => {
  // Read directly from localStorage to avoid circular Zustand import
  try {
    const raw = localStorage.getItem("auth");
    const { accessToken } = raw ? JSON.parse(raw) : {};
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
  } catch {
    // ignore
  }
  return config;
});

// ── Response interceptor — handle 401 → refresh ───────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return client(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const raw = localStorage.getItem("auth");
      const stored = raw ? JSON.parse(raw) : {};
      const refreshToken = stored.refreshToken;

      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = data.accessToken;

      // Update stored access token
      localStorage.setItem(
        "auth",
        JSON.stringify({ ...stored, accessToken: newAccessToken })
      );

      // Update Zustand store (dynamic import to avoid circular dep)
      const { default: useAuthStore } = await import("../store/authStore");
      const { user } = useAuthStore.getState();
      useAuthStore.getState().setAuth(user, newAccessToken);

      processQueue(null, newAccessToken);
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear auth and redirect to login
      localStorage.removeItem("auth");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;