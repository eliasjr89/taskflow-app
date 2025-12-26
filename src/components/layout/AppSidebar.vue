<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
  Home,
  CheckSquare,
  FolderKanban,
  Calendar,
  Tags,
  BarChart2,
  User,
  ChevronLeft,
  ChevronRight,
  Layers,
  LogOut,
} from "lucide-vue-next";

import { useI18n } from "vue-i18n";
import { useSectionTheme } from "../../composables/useSectionTheme";
import { useRouter } from "vue-router";
import { useTaskState } from "../../composables/useTaskState";

const route = useRoute();
const router = useRouter(); // Added router
const { t } = useI18n();
const { theme } = useSectionTheme();
const { resetState } = useTaskState(); // Added resetState
const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const logout = async () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    resetState();
    router.push("/login");
  } catch {
    // ignore
  }
};

const navItems = computed(() => [
  { name: t("nav.home"), path: "/dashboard", icon: Home },
  { name: t("nav.tasks"), path: "/tasks", icon: CheckSquare },
  { name: t("nav.projects"), path: "/projects", icon: FolderKanban },
  { name: t("nav.calendar"), path: "/calendar", icon: Calendar },
  { name: t("nav.tags"), path: "/tags", icon: Tags },
  { name: t("nav.analytics"), path: "/analytics", icon: BarChart2 },
  { name: t("nav.profile"), path: "/profile", icon: User },
]);
</script>

<template>
  <aside
    class="hidden md:flex flex-col p-2 gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-300 h-[calc(100vh-4rem)] sticky top-8 ml-4 shadow-lg shrink-0"
    :class="[isCollapsed ? 'w-20' : 'w-64']">
    <!-- Header with Toggle -->
    <div
      class="flex items-center justify-between mb-2 pb-4 border-b border-gray-200/30 dark:border-gray-700/30 relative px-2 pt-2">
      <div class="flex items-center gap-3 transition-all duration-300 px-1">
        <!-- Logo Container (Always visible) -->
        <div
          :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-linear-to-br min-w-[32px] shrink-0',
            theme.sidebar.active
              .split(' ')
              .filter((c) => c.startsWith('from-') || c.startsWith('to-'))
              .join(' '),
          ]">
          <Layers class="w-5 h-5 text-white" />
        </div>

        <!-- Title (Collapsible) -->
        <div
          class="overflow-hidden transition-all duration-300"
          :class="[isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto']">
          <h1
            class="text-xl font-bold text-gray-800 dark:text-white font-heading whitespace-nowrap tracking-wide">
            TaskFlow
          </h1>
        </div>
      </div>

      <button
        @click="toggleSidebar"
        class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors absolute"
        :class="
          isCollapsed ? 'left-1/2 -translate-x-1/2 top-4' : 'right-0 top-3'
        ">
        <component
          :is="isCollapsed ? ChevronRight : ChevronLeft"
          class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="flex flex-col gap-4 flex-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium relative group overflow-hidden"
        :class="[
          route.path === item.path
            ? theme.sidebar.active
            : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50',
        ]">
        <component :is="item.icon" class="w-5 h-5 min-w-[20px]" />

        <span
          class="transition-all duration-300 whitespace-nowrap"
          :class="[
            isCollapsed
              ? 'opacity-0 w-0 translate-x-4'
              : 'opacity-100 w-auto translate-x-0',
          ]">
          {{ item.name }}
        </span>

        <!-- Tooltip for collapsed state -->
        <div
          v-if="isCollapsed"
          class="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {{ item.name }}
        </div>
      </RouterLink>
    </nav>

    <!-- Logout Section -->
    <div
      class="border-t border-gray-200/30 dark:border-gray-700/30 pt-2 mt-auto">
      <button
        @click="logout"
        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium relative group overflow-hidden text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 group-logout"
        :title="isCollapsed ? t('common.logout') : ''">
        <LogOut
          class="w-5 h-5 min-w-[20px] transition-transform duration-300 group-hover:scale-110" />

        <span
          class="transition-all duration-300 whitespace-nowrap font-bold"
          :class="[
            isCollapsed
              ? 'opacity-0 w-0 translate-x-4'
              : 'opacity-100 w-auto translate-x-0',
          ]">
          {{ t("common.logout") }}
        </span>

        <!-- Tooltip for collapsed -->
        <div
          v-if="isCollapsed"
          class="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {{ t("common.logout") }}
        </div>
      </button>
    </div>
  </aside>
</template>
