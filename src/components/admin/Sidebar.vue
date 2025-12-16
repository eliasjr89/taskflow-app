<script setup lang="ts">
import { useSectionTheme } from "@/composables/useSectionTheme";

const { theme } = useSectionTheme();

const menuItems = [
  { name: "Overview", icon: "fa-chart-pie", path: "/admin/overview" },
  { name: "Gestión Usuarios", icon: "fa-users", path: "/admin/users" },
  { name: "Proyectos", icon: "fa-briefcase", path: "/admin/projects" },
  { name: "Tareas", icon: "fa-list-check", path: "/admin/tasks" },
  { name: "Base de Datos", icon: "fa-database", path: "/admin/database" },
  { name: "Mi Perfil", icon: "fa-id-badge", path: "/admin/profile" },
];

const logout = async () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/exit";
  } catch {
    // ignore
  }
};
</script>

<template>
  <aside
    class="fixed left-0 top-0 bottom-0 w-[260px] bg-bg-dark border-r border-slate-800 hidden md:flex flex-col z-50 transition-all duration-300">
    <!-- Logo -->
    <div class="h-24 flex items-center px-8 mb-2">
      <div class="flex items-center gap-3 text-white">
        <!-- Synced Logo Background -->
        <div
          :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 bg-linear-to-br',
            theme.sidebar.active
              .split(' ')
              .filter(
                (c) =>
                  c.startsWith('from-') ||
                  c.startsWith('to-') ||
                  c.startsWith('via-') ||
                  c.startsWith('dark:')
              )
              .join(' '),
          ]">
          <i class="fa-solid fa-layer-group text-lg text-white"></i>
        </div>
        <span class="font-bold text-xl tracking-wide font-outfit"
          >TaskFlow<span class="text-indigo-400">.</span></span
        >
      </div>
    </div>

    <!-- Navigation Desktop -->
    <nav class="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        v-slot="{ isActive, href, navigate }">
        <a
          :href="href"
          @click="navigate"
          :class="[
            'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group font-medium relative overflow-hidden',
            isActive
              ? theme.sidebar.active
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
          ]">
          <!-- Active Indicator Dot (optional, theme usually handles bg) -->

          <i
            :class="[
              'fa-solid w-6 text-center text-lg transition-transform duration-300 group-hover:scale-110',
              item.icon,
              isActive
                ? 'text-white'
                : 'text-slate-500 group-hover:text-slate-300',
            ]"></i>
          <span class="relative z-10">{{ item.name }}</span>
        </a>
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="p-6 mt-auto border-t border-slate-800/50">
      <button
        @click="logout"
        class="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-slate-400 border border-slate-700/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all justify-center group">
        <i
          class="fa-solid fa-arrow-right-from-bracket group-hover:-translate-x-1 transition-transform"></i>
        <span class="font-bold">Cerrar Sesión</span>
      </button>
    </div>
  </aside>

  <!-- Mobile Bottom Navigation -->
  <nav
    class="fixed bottom-0 left-0 right-0 bg-bg-dark/95 backdrop-blur-xl border-t border-slate-800 md:hidden z-50 flex justify-around items-center h-16 px-2 pb-safe shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.3)]">
    <router-link
      v-for="item in menuItems.slice(0, 5)"
      :key="item.path"
      :to="item.path"
      v-slot="{ isActive, href, navigate }">
      <a
        :href="href"
        @click="navigate"
        :class="[
          'flex flex-col items-center justify-center w-full h-full text-xs gap-1 active:scale-95 transition-transform',
          isActive ? theme.sidebar.icon : 'text-slate-500',
        ]">
        <div class="text-xl relative">
          <i :class="['fa-solid', item.icon]"></i>
          <span
            v-if="isActive"
            class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current shadow-lg shadow-current"></span>
        </div>
      </a>
    </router-link>

    <router-link to="/admin/profile" v-slot="{ isActive, href, navigate }">
      <a
        :href="href"
        @click="navigate"
        :class="[
          'flex flex-col items-center justify-center w-full h-full text-xs gap-1 active:scale-95 transition-transform',
          isActive ? theme.sidebar.icon : 'text-slate-500',
        ]">
        <div class="text-xl relative">
          <i class="fa-solid fa-user"></i>
          <span
            v-if="isActive"
            class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current shadow-lg shadow-current"></span>
        </div>
      </a>
    </router-link>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
