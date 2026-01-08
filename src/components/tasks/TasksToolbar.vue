<script setup lang="ts">
import { ref } from "vue";
import { useTaskFilter } from "../../composables/useTaskFilter";
import { useProjectStore } from "../../stores/projects";
import { storeToRefs } from "pinia";
import { useTagState } from "../../composables/useTagState";
import { useI18n } from "vue-i18n";
import {
  Search,
  Folder,
  Flag,
  Hash,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon,
  LayoutDashboard,
  GanttChartSquare,
  DownloadCloud,
  Plus,
} from "lucide-vue-next";

const { t } = useI18n();
const { filters } = useTaskFilter();
const projectStore = useProjectStore();
const { projects } = storeToRefs(projectStore);
const { tags } = useTagState();

defineProps<{
  viewMode: "board" | "table" | "matrix" | "timeline";
}>();

const emit = defineEmits<{
  (e: "update:viewMode", mode: "board" | "table" | "matrix" | "timeline"): void;
  (e: "export"): void;
  (e: "add"): void;
}>();

const openDropdown = ref<"status" | "priority" | "project" | "tag" | null>(
  null
);

function toggleDropdown(name: "status" | "priority" | "project" | "tag") {
  if (openDropdown.value === name) {
    openDropdown.value = null;
  } else {
    openDropdown.value = name;
  }
}

function closeDropdown() {
  openDropdown.value = null;
}

const getProjectColor = (color: string) => {
  const colors: Record<string, string> = {
    indigo:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[color] || colors.indigo;
};
</script>

<template>
  <div
    class="glass-card p-4 rounded-2xl mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-0 z-20">
    <!-- Row 1 (Mobile): Search Input -->
    <div class="w-full lg:w-64 shrink-0">
      <div class="relative group">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          :placeholder="t('common.search')"
          v-model="filters.search"
          class="block w-full pl-10 pr-3 h-9 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all sm:text-sm" />
      </div>
    </div>

    <!-- Row 2 (Mobile): Filters & Add Button -->
    <div
      class="w-full lg:w-auto flex items-center gap-2 order-2 lg:order-0 overflow-hidden">
      <!-- Filters Wrapper -->
      <div class="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <!-- Project Filter -->
        <div class="relative shrink-0">
          <button
            @click="toggleDropdown('project')"
            class="h-9 px-3 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 whitespace-nowrap cursor-pointer"
            :class="
              filters.projectIds.length > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            ">
            <Folder class="w-4 h-4" />
            <span class="hidden lg:inline">{{ t("nav.projects") }}</span>
            <span
              v-if="filters.projectIds.length"
              class="ml-1 bg-indigo-200 dark:bg-indigo-800 px-1.5 py-0.5 rounded-full text-xs"
              >{{ filters.projectIds.length }}</span
            >
          </button>
          <!-- Dropdown -->
          <div
            v-if="openDropdown === 'project'"
            class="absolute top-full left-0 mt-2 w-56 glass-card rounded-xl p-2 z-50 shadow-xl animate-fade-in">
            <div class="space-y-1">
              <button
                v-for="project in projects"
                :key="project.id"
                @click="
                  filters.projectIds.includes(String(project.id))
                    ? (filters.projectIds = filters.projectIds.filter(
                        (id) => id !== String(project.id)
                      ))
                    : filters.projectIds.push(String(project.id))
                "
                class="w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="
                    (getProjectColor(project.color) || '').split(' ')[0]
                  "></div>
                <span class="flex-1 truncate">{{ project.title }}</span>
                <CheckCircle2
                  v-if="filters.projectIds.includes(String(project.id))"
                  class="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Priority Filter -->
        <div class="relative shrink-0">
          <button
            @click="toggleDropdown('priority')"
            class="h-9 px-3 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 whitespace-nowrap cursor-pointer"
            :class="
              filters.priorities.length > 0
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            ">
            <Flag class="w-4 h-4" />
            <span class="hidden lg:inline">{{ t("tasks.priority") }}</span>
            <span
              v-if="filters.priorities.length"
              class="ml-1 bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 rounded-full text-xs"
              >{{ filters.priorities.length }}</span
            >
          </button>
          <!-- Dropdown -->
          <div
            v-if="openDropdown === 'priority'"
            class="absolute top-full left-0 mt-2 w-48 glass-card rounded-xl p-2 z-50 shadow-xl animate-fade-in">
            <div class="space-y-1">
              <button
                v-for="p in ['low', 'medium', 'high', 'urgent']"
                :key="p"
                @click="
                  filters.priorities.includes(p)
                    ? (filters.priorities = filters.priorities.filter(
                        (pr) => pr !== p
                      ))
                    : filters.priorities.push(p)
                "
                class="w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 capitalize cursor-pointer">
                <span class="flex-1">{{ t("tasks." + p) }}</span>
                <CheckCircle2
                  v-if="filters.priorities.includes(p)"
                  class="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tags Filter -->
        <div class="relative shrink-0" v-if="tags.length > 0">
          <button
            @click="toggleDropdown('tag')"
            class="h-9 px-3 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 whitespace-nowrap cursor-pointer"
            :class="
              filters.tagIds.length > 0
                ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            ">
            <Hash class="w-4 h-4" />
            <span class="hidden lg:inline">{{ t("nav.tags") }}</span>
            <span
              v-if="filters.tagIds.length"
              class="ml-1 bg-purple-200 dark:bg-purple-800 px-1.5 py-0.5 rounded-full text-xs"
              >{{ filters.tagIds.length }}</span
            >
          </button>
          <!-- Dropdown -->
          <div
            v-if="openDropdown === 'tag'"
            class="absolute top-full left-0 mt-2 w-56 glass-card rounded-xl p-2 z-50 shadow-xl animate-fade-in">
            <div class="space-y-1">
              <button
                v-for="tag in tags"
                :key="tag.id"
                @click="
                  filters.tagIds.includes(String(tag.id))
                    ? (filters.tagIds = filters.tagIds.filter(
                        (id) => id !== String(tag.id)
                      ))
                    : filters.tagIds.push(String(tag.id))
                "
                class="w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                <span class="flex-1 truncate">{{ tag.name }}</span>
                <CheckCircle2
                  v-if="filters.tagIds.includes(String(tag.id))"
                  class="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Add Task Button (Visible lg:hidden) -->
      <button
        @click="emit('add')"
        class="lg:hidden shrink-0 w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 cursor-pointer">
        <Plus class="w-5 h-5" />
      </button>
    </div>

    <!-- Row 3 (Mobile): Actions -->
    <div
      class="flex items-center justify-between w-full lg:w-auto gap-3 lg:ml-auto order-3 lg:order-0 overflow-x-auto no-scrollbar">
      <!-- View Switcher -->
      <div
        class="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
        <button
          @click="emit('update:viewMode', 'board')"
          :title="t('tasks.board_view')"
          class="flex items-center gap-1.5 h-9 px-3 rounded-md transition-all font-medium cursor-pointer"
          :class="
            viewMode === 'board'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <LayoutGrid class="w-4 h-4" />
          <span class="text-[10px] lg:text-sm">{{
            t("tasks.board_view")
          }}</span>
        </button>
        <button
          @click="emit('update:viewMode', 'table')"
          :title="t('tasks.table_view')"
          class="flex items-center gap-1.5 h-9 px-3 rounded-md transition-all font-medium cursor-pointer"
          :class="
            viewMode === 'table'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <TableIcon class="w-4 h-4" />
          <span class="text-[10px] lg:text-sm">{{
            t("tasks.table_view")
          }}</span>
        </button>
        <button
          @click="emit('update:viewMode', 'matrix')"
          :title="t('tasks.matrix_view')"
          class="flex items-center gap-1.5 h-9 px-3 rounded-md transition-all font-medium cursor-pointer"
          :class="
            viewMode === 'matrix'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <LayoutDashboard class="w-4 h-4" />
          <span class="text-[10px] lg:text-sm">{{
            t("tasks.matrix_view")
          }}</span>
        </button>
        <button
          @click="emit('update:viewMode', 'timeline')"
          :title="t('tasks.timeline_view')"
          class="flex items-center gap-1.5 h-9 px-3 rounded-md transition-all font-medium cursor-pointer"
          :class="
            viewMode === 'timeline'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <GanttChartSquare class="w-4 h-4" />
          <span class="text-[10px] lg:text-sm">{{
            t("tasks.timeline_view")
          }}</span>
        </button>

        <!-- Divider -->
        <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <!-- Export Button (Inside Box) -->
        <button
          @click="emit('export')"
          :title="t('common.export')"
          class="flex items-center justify-center h-9 w-9 rounded-md transition-all font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 cursor-pointer">
          <DownloadCloud class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Add Task Button -->
        <button
          @click="emit('add')"
          class="hidden lg:flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer">
          <Plus class="w-5 h-5" />
          <span>{{ t("tasks.add_task") }}</span>
        </button>
      </div>
    </div>

    <!-- Backdrop for dropdowns -->
    <div
      v-if="openDropdown"
      class="fixed inset-0 z-10"
      @click="closeDropdown"></div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
