<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSectionTheme } from "@/composables/useSectionTheme";

const { theme } = useSectionTheme();
const { t } = useI18n();

const menuItems = computed(() => [
  { name: t("admin.overview"), icon: "fa-chart-pie", path: "/admin/overview" },
  { name: t("admin.users"), icon: "fa-users", path: "/admin/users" },
  { name: t("admin.tasks"), icon: "fa-list-check", path: "/admin/tasks" },
  { name: t("admin.projects"), icon: "fa-briefcase", path: "/admin/projects" },
  { name: t("admin.roles"), icon: "fa-shield-halved", path: "/admin/roles" },
  { name: t("admin.audit"), icon: "fa-file-shield", path: "/admin/audit" },
  { name: t("admin.profile"), icon: "fa-id-badge", path: "/admin/profile" },
  { name: t("admin.settings"), icon: "fa-cogs", path: "/admin/settings" },
  { name: t("admin.database"), icon: "fa-database", path: "/admin/database" },
]);

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
                  c.startsWith('dark:'),
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
        <span class="font-bold">{{ t("common.logout") }}</span>
      </button>
    </div>
  </aside>

  <!-- Mobile Bottom Navigation (Standardized) -->
  <nav
    class="fixed bottom-0 left-0 w-full bg-bg-dark/95 backdrop-blur-xl border-t border-white/10 pb-safe z-50 md:hidden shadow-2xl">
    <div class="flex items-center px-4 py-4 overflow-x-auto no-scrollbar gap-2">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        v-slot="{ isActive, href, navigate }">
        <a
          :href="href"
          @click="navigate"
          class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group min-w-[50px] outline-none shrink-0"
          :class="isActive ? '' : 'text-white/40 hover:text-white/70'">
          <!-- Active Indicator (Glow) -->
          <div
            v-if="isActive"
            class="absolute -top-4 w-10 h-1 rounded-full shadow-lg transition-all duration-500 ease-out animate-slide-down bg-linear-to-r"
            :class="
              theme.sidebar.active
                .split(' ')
                .filter((c) => c.startsWith('from-') || c.startsWith('to-'))
                .join(' ')
            "></div>

          <!-- Active Background Shape (Subtle) -->
          <div
            v-if="isActive"
            class="absolute inset-0 bg-white/5 rounded-xl blur-md -z-10"></div>

          <div
            class="text-xl relative transition-transform duration-300 group-active:scale-95">
            <i
              :class="[
                'fa-solid',
                item.icon,
                isActive ? theme.sidebar.icon : '',
              ]"></i>
          </div>
        </a>
      </router-link>

      <!-- Logout (Mobile) -->
      <button
        @click="logout"
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group min-w-[50px] outline-none text-white/40 hover:text-red-400 cursor-pointer shrink-0">
        <div
          class="text-xl relative transition-transform duration-300 group-active:scale-95">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </div>
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
