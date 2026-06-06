import { create } from "zustand";

// Phase 1: tokens stored in localStorage for dev convenience.
// Phase 5 will migrate to httpOnly cookies for production security.

const LOCAL_KEY = "auth";

function loadPersistedAuth() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : { user: null, accessToken: null };
  } catch {
    return { user: null, accessToken: null };
  }
}

const useAuthStore = create((set) => ({
  ...loadPersistedAuth(),

  /**
   * Persist user + accessToken to store and localStorage.
   * @param {{ id: string, email: string, name: string }} user
   * @param {string} accessToken
   */
  setAuth: (user, accessToken) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ user, accessToken }));
    set({ user, accessToken });
  },

  /**
   * Clear auth state from store and localStorage.
   */
  clearAuth: () => {
    localStorage.removeItem(LOCAL_KEY);
    set({ user: null, accessToken: null });
  },
}));

export default useAuthStore;