<script setup lang="ts">
import { ref } from "vue";
import { useTaskFilter } from "../../composables/useTaskFilter";
import { useProjectState } from "../../composables/useProjectState";
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
const { projects } = useProjectState();
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
    <!-- Search & Filters Group -->
    <div class="flex flex-1 w-full lg:w-auto gap-3 items-center">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-xs group">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          :placeholder="t('common.search')"
          v-model="filters.search"
          class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all sm:text-sm" />
      </div>

      <!-- Filters -->
      <div
        class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
        <!-- Project Filter -->
        <div class="relative">
          <button
            @click="toggleDropdown('project')"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 whitespace-nowrap"
            :class="
              filters.projectIds.length > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            ">
            <Folder class="w-4 h-4" />
            Projects
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
                  filters.projectIds.includes(project.id)
                    ? (filters.projectIds = filters.projectIds.filter(
                        (id) => id !== project.id
                      ))
                    : filters.projectIds.push(project.id)
                "
                class="w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="
                    (getProjectColor(project.color) || '').split(' ')[0]
                  "></div>
                <span class="flex-1 truncate">{{ project.title }}</span>
                <CheckCircle2
                  v-if="filters.projectIds.includes(project.id)"
                  class="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Priority Filter -->
        <div class="relative">
          <button
            @click="toggleDropdown('priority')"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 whitespace-nowrap"
            :class="
              filters.priorities.length > 0
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            ">
            <Flag class="w-4 h-4" />
            Priority
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
                class="w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 capitalize">
                <span class="flex-1">{{ p }}</span>
                <CheckCircle2
                  v-if="filters.priorities.includes(p)"
                  class="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tags Filter -->
        <div class="relative" v-if="tags.length > 0">
          <button
            @click="toggleDropdown('tag')"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 whitespace-nowrap"
            :class="
              filters.tagIds.length > 0
                ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            ">
            <Hash class="w-4 h-4" />
            Tags
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
                  filters.tagIds.includes(tag.id)
                    ? (filters.tagIds = filters.tagIds.filter(
                        (id) => id !== tag.id
                      ))
                    : filters.tagIds.push(tag.id)
                "
                class="w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <span class="flex-1 truncate">{{ tag.name }}</span>
                <CheckCircle2
                  v-if="filters.tagIds.includes(tag.id)"
                  class="w-4 h-4 text-indigo-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Group -->
    <div class="flex items-center gap-3 w-full lg:w-auto justify-end">
      <!-- View Switcher -->
      <div
        class="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          @click="emit('update:viewMode', 'board')"
          :title="t('tasks.board_view')"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium"
          :class="
            viewMode === 'board'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <LayoutGrid class="w-4 h-4" />
          <span class="hidden sm:inline">Tablero</span>
        </button>
        <button
          @click="emit('update:viewMode', 'table')"
          :title="'Vista Tabla'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium"
          :class="
            viewMode === 'table'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <TableIcon class="w-4 h-4" />
          <span class="hidden sm:inline">Tabla</span>
        </button>
        <button
          @click="emit('update:viewMode', 'matrix')"
          :title="'Matriz de Prioridades'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium"
          :class="
            viewMode === 'matrix'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <LayoutDashboard class="w-4 h-4" />
          <span class="hidden sm:inline">Matriz</span>
        </button>
        <button
          @click="emit('update:viewMode', 'timeline')"
          :title="'Cronograma'"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium"
          :class="
            viewMode === 'timeline'
              ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          ">
          <GanttChartSquare class="w-4 h-4" />
          <span class="hidden sm:inline">Timeline</span>
        </button>
      </div>

      <!-- Export Button -->
      <button
        @click="emit('export')"
        title="Export CSV"
        class="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all shadow-sm">
        <DownloadCloud class="w-5 h-5" />
      </button>

      <!-- Add Task Button -->
      <button
        @click="emit('add')"
        class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer">
        <Plus class="w-5 h-5" />
        <span>{{ t("tasks.add_task") }}</span>
      </button>
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
