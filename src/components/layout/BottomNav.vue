<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import {
  Home,
  CheckSquare,
  FolderKanban,
  Calendar,
  Tags,
  BarChart2,
  User,
  LogOut,
} from "lucide-vue-next";
import { useSectionTheme } from "../../composables/useSectionTheme";

import { useTaskStore } from "../../stores/tasks";
import { useAuthStore } from "../../stores/auth";

const route = useRoute();
const { theme } = useSectionTheme();
const taskStore = useTaskStore();
const authStore = useAuthStore();

const logout = async () => {
  try {
    taskStore.reset();
    authStore.logout();
    // AuthStore handles navigation usually, but just in case:
    // router.push("/"); // AuthStore does this too
  } catch {
    // ignore
  }
};

const navItems = [
  { name: "Inicio", path: "/dashboard", icon: Home }, // Updated path to /dashboard to match router
  { name: "Tareas", path: "/tasks", icon: CheckSquare },
  { name: "Proyectos", path: "/projects", icon: FolderKanban },
  { name: "Calendario", path: "/calendar", icon: Calendar },
  { name: "Etiquetas", path: "/tags", icon: Tags },
  { name: "Estadísticas", path: "/analytics", icon: BarChart2 },
  { name: "Perfil", path: "/profile", icon: User },
];

const isActive = (path: string) =>
  route.path === path || (path === "/dashboard" && route.path === "/");
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 w-full bg-bg-dark/95 backdrop-blur-xl border-t border-white/10 pb-safe z-50 md:hidden shadow-2xl">
    <div
      class="flex justify-between items-center px-6 py-4 overflow-x-auto no-scrollbar">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group min-w-[50px] outline-none"
        :class="isActive(item.path) ? '' : 'text-white/40 hover:text-white/70'">
        <!-- Active Indicator (Glow) -->
        <div
          v-if="isActive(item.path)"
          class="absolute -top-4 w-10 h-1 rounded-full shadow-lg transition-all duration-500 ease-out animate-slide-down bg-linear-to-r"
          :class="
            theme.sidebar.active
              .split(' ')
              .filter((c) => c.startsWith('from-') || c.startsWith('to-'))
              .join(' ')
          "></div>

        <!-- Active Background Shape (Subtle) -->
        <div
          v-if="isActive(item.path)"
          class="absolute inset-0 bg-white/5 rounded-xl blur-md -z-10"></div>

        <!-- Icons -->
        <component
          :is="item.icon"
          class="w-6 h-6 transition-transform duration-300 group-active:scale-95"
          :class="isActive(item.path) ? theme.sidebar.icon : ''" />

        <!-- No text label as requested -->
      </RouterLink>

      <!-- Logout Button -->
      <button
        @click="logout"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group min-w-[50px] outline-none text-white/40 hover:text-red-400 cursor-pointer">
        <LogOut
          class="w-6 h-6 transition-transform duration-300 group-active:scale-95" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}
</style>
