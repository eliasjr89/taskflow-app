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
} from "lucide-vue-next";

import { useI18n } from "vue-i18n";
import { useSectionTheme } from "../composables/useSectionTheme";

const route = useRoute();
const { t } = useI18n();
const { theme } = useSectionTheme();
const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navItems = computed(() => [
  { name: t("nav.home"), path: "/", icon: Home },
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
    class="hidden md:flex flex-col p-2 gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-300 h-[calc(100vh-6rem)] sticky top-24 shadow-lg"
    :class="[isCollapsed ? 'w-15' : 'w-50']">
    <!-- Header with Toggle -->
    <div
      class="flex items-center justify-between mb-2 pb-4 border-b border-gray-200/30 dark:border-gray-700/30 relative">
      <div
        class="flex flex-col overflow-hidden transition-all duration-300"
        :class="[isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto']">
        <h1
          class="text-3xl font-bold bg-linear-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-heading whitespace-nowrap">
          {{ t("nav.menu") }}
        </h1>
        <p
          class="text-xs text-gray-600 dark:text-gray-400 mt-1 whitespace-nowrap">
          {{ t("nav.subtitle") }}
        </p>
      </div>

      <button
        @click="toggleSidebar"
        class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors absolute right-0 top-0"
        :class="{ 'right-1/2 translate-x-1/2': isCollapsed }">
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
  </aside>
</template>
