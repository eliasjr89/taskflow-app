import { ref } from "vue";
import api from "../services/api";

// Defined basically to avoid strict type issues if User type is complex to import right now,
// but ideally should import from types.
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  lastname: string;
  role: string;
  profile_image?: string;
  created_at?: string;
  [key: string]: any;
}

const user = ref<User | null>(null);

export function useUserState() {
  const fetchUser = async () => {
    try {
      const response = await api.get("/user/profile");
      const userData = response.data.data || response.data;
      user.value = userData;
      return userData;
    } catch {
      // console.error('Failed to fetch user', error);
      return null;
    }
  };

  const setUser = (userData: User) => {
    user.value = userData;
  };

  const updateUserState = (updates: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...updates };
    }
  };

  return {
    user,
    fetchUser,
    setUser,
    updateUserState,
  };
}
