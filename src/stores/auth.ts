// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import router from "../router";
import { AuthResponseSchema, type User } from "../schemas/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));
  const isAdmin = computed(() => user.value?.role === "admin");
  const isAuthenticated = computed(() => !!token.value);

  // Load user from localStorage if available (to prevent flicker)
  if (localStorage.getItem("user")) {
    try {
      user.value = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      localStorage.removeItem("user");
    }
  }

  const setSession = (newToken: string, newUser: User) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const login = async (credentials: any) => {
    const { data } = await api.post("/auth/login", credentials);
    const resData = data.data || data; // Handle API wrapper

    // Validate Response
    const parsedData = AuthResponseSchema.parse(resData);

    setSession(parsedData.token, parsedData.user);
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
    router.push("/login");
  };

  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const { data } = await api.get("/user/profile");
      // Update user data but keep token
      const userData = data.data || data;
      user.value = userData;
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      // If profile fetch fails (e.g. invalid token), logout
      logout();
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user.value) {
      const updatedUser = { ...user.value, ...updates };
      user.value = updatedUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
