// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import router from "../router";
import { AuthResponseSchema, type User } from "../schemas/auth";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(
    localStorage.getItem("token") || sessionStorage.getItem("token"),
  );

  // Initialize user from storage
  const user = ref<User | null>(null);
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  if (userStr) {
    try {
      user.value = JSON.parse(userStr);
    } catch {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    }
  }

  const isAdmin = computed(() => user.value?.role === "admin");
  const isAuthenticated = computed(() => !!token.value);

  const setSession = (
    newToken: string,
    newUser: User,
    remember: boolean = true,
  ) => {
    token.value = newToken;
    user.value = newUser;

    const storage = remember ? localStorage : sessionStorage;

    // Clear other storage to prevent sync issues
    if (remember) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    storage.setItem("token", newToken);
    storage.setItem("user", JSON.stringify(newUser));
  };

  const login = async (credentials: any) => {
    // Extract remember flag (not sent to API)
    const { remember, ...apiCredentials } = credentials;

    const { data } = await api.post("/auth/login", apiCredentials);
    const resData = data.data || data;

    // Validate Response
    const parsedData = AuthResponseSchema.parse(resData);

    setSession(parsedData.token, parsedData.user, remember === true);
    return parsedData.user;
  };

  const register = async (userData: any) => {
    const { data } = await api.post("/auth/register", userData);
    const resData = data.data || data;

    // Validate Response
    const parsedData = AuthResponseSchema.parse(resData);

    setSession(parsedData.token, parsedData.user);
    return parsedData.user;
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    router.push("/");
  };

  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const { data } = await api.get("/user/profile");
      const userData = data.data || data;
      user.value = userData;

      // Persist to current storage
      const storage = localStorage.getItem("token")
        ? localStorage
        : sessionStorage;
      storage.setItem("user", JSON.stringify(userData));
    } catch {
      logout();
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user.value) {
      const updatedUser = { ...user.value, ...updates };
      user.value = updatedUser;

      const storage = localStorage.getItem("token")
        ? localStorage
        : sessionStorage;
      storage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
    updateUser,
  };
});
