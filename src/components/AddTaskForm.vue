<script setup lang="ts">
import { ref } from "vue";
import { useTasks } from "../composables/useTask";
import { useTaskState } from "../composables/useTaskState";
import { useTagState } from "../composables/useTagState";
import {
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Music,
  ChevronDown,
  Plus,
  Hash,
  Flag,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import DatePicker from "./DatePicker.vue";

const { t } = useI18n();

const newTask = ref("");
const selectedProjectId = ref<string | undefined>(undefined);
const selectedTags = ref<string[]>([]);
const selectedPriority = ref<"low" | "medium" | "high" | undefined>(undefined);
const selectedDueDate = ref<string>(new Date().toISOString());
const isDropdownOpen = ref(false);
const isTagDropdownOpen = ref(false);
const isPriorityDropdownOpen = ref(false);

const { addTask } = useTasks();
const { projects } = useTaskState();
const { tags } = useTagState();

const iconMap: Record<string, any> = {
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Music,
};

const handleSubmit = async () => {
  if (!newTask.value.trim()) return;

  const success = await addTask(
    newTask.value.trim(),
    selectedProjectId.value,
    selectedTags.value.length > 0 ? selectedTags.value : undefined,
    selectedPriority.value,
    selectedDueDate.value ? new Date(selectedDueDate.value) : undefined
  );

  if (success) {
    newTask.value = "";
    selectedProjectId.value = undefined;
    selectedTags.value = [];
    selectedPriority.value = undefined;
    selectedDueDate.value = new Date().toISOString();
    isDropdownOpen.value = false;
    isTagDropdownOpen.value = false;
    isPriorityDropdownOpen.value = false;
  }
};

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function selectProject(projectId: string | undefined) {
  selectedProjectId.value = projectId;
  isDropdownOpen.value = false;
}

function getSelectedProject() {
  return projects.value.find((p) => p.id === selectedProjectId.value);
}

const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo:
      "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
    purple:
      "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    pink: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400",
    rose: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
    orange:
      "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    amber:
      "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    green:
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    teal: "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400",
    cyan: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[color] || colors.indigo;
};

function toggleTagDropdown() {
  isTagDropdownOpen.value = !isTagDropdownOpen.value;
}

function toggleTag(tagId: string) {
  const index = selectedTags.value.indexOf(tagId);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tagId);
  }
}

const getTagColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    purple:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    orange:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    amber:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    green:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };
  return (
    colorMap[color] ||
    "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
  );
};

const priorities = [
  {
    value: "low",
    label: t("tasks.low"),
    color: "text-green-500 bg-green-100 dark:bg-green-900/30",
  },
  {
    value: "medium",
    label: t("tasks.medium"),
    color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    value: "high",
    label: t("tasks.high"),
    color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    value: "urgent",
    label: t("tasks.urgent"),
    color: "text-red-500 bg-red-100 dark:bg-red-900/30",
  },
];

function getPriorityColor(priority: string) {
  const p = priorities.find((p) => p.value === priority);
  return p ? p.color : "text-gray-500";
}

function getPriorityLabel(priority: string) {
  const p = priorities.find((p) => p.value === priority);
  return p ? p.label : t("tasks.priority");
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="relative w-full glass-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/30 dark:border-gray-700/30 overflow-visible z-40">
    <!-- Desktop: Grid with button spanning 2 rows, Mobile: Stack -->
    <div class="flex flex-col gap-3 p-4 md:p-5">
      <!-- Row 1: Selectors -->
      <div class="flex flex-wrap items-center gap-2 w-full">
        <!-- Project Selector -->
        <div class="relative shrink-0">
          <button
            type="button"
            @click="toggleDropdown"
            class="px-4 py-3 rounded-xl border border-gray-200/50 shadow-lg dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 min-w-[140px]"
            :class="[
            getSelectedProject() ? getColorClass(getSelectedProject()!.color) : 'text-gray-500 dark:text-gray-400'
          ]">
            <template v-if="getSelectedProject()">
              <component
                :is="iconMap[getSelectedProject()!.icon] || Folder"
                class="w-4 h-4" />
              <span class="text-sm font-medium truncate flex-1 text-left">
                {{ getSelectedProject()!.title }}
              </span>
            </template>
            <template v-else>
              <Folder class="w-4 h-4 shrink-0" />
              <span
                class="text-sm font-medium flex-1 text-left whitespace-nowrap"
                >{{ t("tasks.project") }}</span
              >
            </template>
            <ChevronDown class="w-4 h-4 opacity-50 shrink-0" />
          </button>

          <!-- Dropdown Menu - Opens DOWNWARD -->
          <div
            v-if="isDropdownOpen"
            class="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-10000 animate-fade-in">
            <div class="p-2 space-y-1 max-h-60 overflow-y-auto">
              <button
                type="button"
                @click="selectProject(undefined)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                <div
                  class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 shrink-0">
                  <Folder class="w-4 h-4" />
                </div>
                <span
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1"
                  >{{ t("tasks.without_project") }}</span
                >
                <div
                  v-if="!selectedProjectId"
                  class="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
              </button>

              <button
                v-for="project in projects"
                :key="project.id"
                type="button"
                @click="selectProject(project.id)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                <div
                  class="p-1.5 rounded-md shrink-0"
                  :class="getColorClass(project.color)">
                  <component
                    :is="iconMap[project.icon] || Folder"
                    class="w-4 h-4" />
                </div>
                <span
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1"
                  >{{ project.title }}</span
                >
                <div
                  v-if="selectedProjectId === project.id"
                  class="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Tag Selector -->
        <div v-if="tags.length > 0" class="relative shrink-0">
          <button
            type="button"
            @click="toggleTagDropdown"
            class="px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 min-w-[120px]"
            :class="
              selectedTags.length > 0 ? '' : 'text-gray-500 dark:text-gray-400'
            ">
            <Hash class="w-4 h-4 shrink-0" />
            <span
              class="text-sm font-medium flex-1 text-left whitespace-nowrap">
              {{
                selectedTags.length > 0
                  ? `${selectedTags.length} ${t("tasks.tags")}${
                      selectedTags.length > 1 ? "s" : ""
                    }`
                  : t("tasks.tags")
              }}
            </span>
            <ChevronDown class="w-4 h-4 opacity-50 shrink-0" />
          </button>

          <!-- Tag Dropdown - Opens DOWNWARD -->
          <div
            v-if="isTagDropdownOpen"
            class="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-10000 animate-fade-in">
            <div class="p-2 space-y-1 max-h-60 overflow-y-auto">
              <button
                v-for="tag in tags"
                :key="tag.id"
                type="button"
                @click="toggleTag(tag.id)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                <div
                  class="p-1.5 rounded-md shrink-0"
                  :class="getTagColorClass(tag.color)">
                  <Hash class="w-4 h-4" />
                </div>
                <span
                  class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1"
                  >{{ tag.name }}</span
                >
                <div
                  v-if="selectedTags.includes(tag.id)"
                  class="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center shrink-0">
                  <svg
                    class="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="3">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Priority Selector -->
        <div class="relative shrink-0">
          <button
            type="button"
            @click="isPriorityDropdownOpen = !isPriorityDropdownOpen"
            class="px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 min-w-[120px]"
            :class="
              selectedPriority
                ? getPriorityColor(selectedPriority)
                : 'text-gray-500 dark:text-gray-400'
            ">
            <Flag
              class="w-4 h-4 shrink-0"
              :class="{ 'fill-current': selectedPriority }" />
            <span
              class="text-sm font-medium flex-1 text-left whitespace-nowrap">
              {{
                selectedPriority
                  ? getPriorityLabel(selectedPriority)
                  : t("tasks.priority")
              }}
            </span>
            <ChevronDown class="w-4 h-4 opacity-50 shrink-0" />
          </button>

          <!-- Priority Dropdown - Opens DOWNWARD -->
          <div
            v-if="isPriorityDropdownOpen"
            class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-10000 animate-fade-in">
            <div class="p-2 space-y-1">
              <button
                type="button"
                @click="
                  selectedPriority = undefined;
                  isPriorityDropdownOpen = false;
                "
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left text-gray-500">
                <Flag class="w-4 h-4" />
                <span class="text-sm font-medium flex-1">{{
                  t("tasks.without_priority")
                }}</span>
                <div
                  v-if="!selectedPriority"
                  class="w-2 h-2 rounded-full bg-indigo-500"></div>
              </button>
              <button
                v-for="p in priorities"
                :key="p.value"
                type="button"
                @click="
                  selectedPriority = p.value as any;
                  isPriorityDropdownOpen = false;
                "
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                :class="p.color">
                <Flag class="w-4 h-4 fill-current" />
                <span class="text-sm font-medium flex-1">{{ p.label }}</span>
                <div
                  v-if="selectedPriority === p.value"
                  class="w-2 h-2 rounded-full bg-current"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Due Date Selector -->
        <DatePicker v-model="selectedDueDate" />
      </div>

      <!-- Row 2: Input + Button -->
      <div class="flex flex-col md:flex-row gap-3 w-full">
        <!-- Input (75% on desktop) -->
        <input
          id="new-task"
          type="text"
          v-model="newTask"
          :placeholder="t('tasks.placeholder')"
          class="w-full md:w-[75%] min-w-0 bg-transparent border-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 text-base md:text-lg px-2" />

        <!-- Submit Button (25% on desktop) -->
        <button
          type="submit"
          :disabled="!newTask.trim()"
          class="w-full md:w-[25%] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 md:px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-medium text-sm md:text-base shrink-0">
          <Plus class="w-5 h-5" />
          <span class="hidden md:inline">{{ t("tasks.add_task") }}</span>
        </button>
      </div>
    </div>

    <!-- Backdrop for project dropdown -->
    <div
      v-if="isDropdownOpen"
      class="fixed inset-0 z-9999"
      @click="isDropdownOpen = false"></div>

    <!-- Backdrop for tag dropdown -->
    <div
      v-if="isTagDropdownOpen"
      class="fixed inset-0 z-9999"
      @click="isTagDropdownOpen = false"></div>

    <!-- Backdrop for priority dropdown -->
    <div
      v-if="isPriorityDropdownOpen"
      class="fixed inset-0 z-9999"
      @click="isPriorityDropdownOpen = false"></div>
  </form>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
