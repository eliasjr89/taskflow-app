<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from 'vue-i18n';
import type { Task, FilterState } from "../types/global";
import { useTaskState } from "../composables/useTaskState";
import { useTagState } from "../composables/useTagState";
import { 
  Search, 
  Filter, 
  CheckSquare, 
  Flag, 
  Folder, 
  Hash, 
  ChevronDown, 
  ChevronUp,
  X
} from "lucide-vue-next";

const { t } = useI18n();
const { projects } = useTaskState();
const { tags } = useTagState();

const props = withDefaults(defineProps<{ 
  tasks: Task[];
  mobile?: boolean;
  showSearch?: boolean;
  deferred?: boolean;
}>(), {
  showSearch: true,
  deferred: false
});

const emit = defineEmits<{
  (e: "update:filters", filters: FilterState): void;
  (e: "selectTask", task: Task): void;
  (e: "close"): void;
}>();

// State for filters
const searchQuery = ref("");
const selectedStatuses = ref<('pending' | 'completed')[]>([]);
const selectedPriorities = ref<string[]>([]);
const selectedProjectIds = ref<string[]>([]);
const selectedTagIds = ref<string[]>([]);

// Accordion state
const openSections = ref({
  status: true,
  priority: true,
  projects: true,
  tags: true
});

const toggleSection = (section: keyof typeof openSections.value) => {
  openSections.value[section] = !openSections.value[section];
};

// Search suggestions
const suggestions = computed(() => {
  if (!searchQuery.value) return [];
  return props.tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 5);
});

// Watch for changes and emit updates (only if NOT deferred)
watch(
  [searchQuery, selectedStatuses, selectedPriorities, selectedProjectIds, selectedTagIds],
  () => {
    if (!props.deferred) {
      emitFilters();
    }
  },
  { deep: true }
);

function emitFilters() {
  emit("update:filters", {
    search: searchQuery.value,
    statuses: selectedStatuses.value,
    priorities: selectedPriorities.value,
    projectIds: selectedProjectIds.value,
    tagIds: selectedTagIds.value
  });
}

function applyFilters() {
  emitFilters();
  emit("close");
}

function clearFilters() {
  selectedStatuses.value = [];
  selectedPriorities.value = [];
  selectedProjectIds.value = [];
  selectedTagIds.value = [];
  // If not deferred, this will trigger the watch and emit. 
  // If deferred, we might want to emit immediately or wait for Apply.
  // Standard UX: Clear usually applies immediately or resets UI. 
  // Let's reset UI and if deferred, user still needs to click Apply to confirm clearing? 
  // No, "Clear" usually implies "Reset and Apply" or just "Reset UI".
  // Let's make Clear reset UI. If deferred, user must click Apply to commit the clear.
  // Actually, user requested "Clear filters OR Apply". 
  // So Clear should probably apply the cleared state.
  if (props.deferred) {
    emitFilters(); // Optional: Apply immediately on clear? Or just reset UI?
    // User said: "Una vez que el usuario realice cualquiera de las dos opciones (limpiar o aplicar), debará actualizarse..."
    // So Clear MUST apply.
    emit("close");
  }
}

function selectSuggestion(task: Task) {
  searchQuery.value = task.title;
  emit("selectTask", task);
  if (props.mobile) emit("close");
}

// Helper to get project color class
const getProjectColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    blue: "bg-blue-500",
  };
  return colors[color] || "bg-indigo-500";
};

// Helper to get tag color class
const getTagColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    pink: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
    rose: "text-rose-600 bg-rose-100 dark:bg-rose-900/30",
    orange: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    amber: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30",
    teal: "text-teal-600 bg-teal-100 dark:bg-teal-900/30",
    cyan: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  };
  return colors[color] || colors.indigo;
};
</script>

<template>
  <aside 
    class="w-full glass-card rounded-2xl p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar transition-all duration-300"
    :class="[
      mobile ? 'h-full rounded-none border-0 bg-white dark:bg-gray-900' : 'md:w-72 h-[calc(100vh-6rem)] sticky top-24'
    ]"
  >
    
    <!-- Mobile Header with Close Button -->
    <div v-if="mobile" class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
      <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ t('common.filters') }}</h2>
      <button @click="emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <X class="w-5 h-5 text-gray-500" />
      </button>
    </div>
    
    <!-- Search Bar -->
    <div v-if="showSearch" class="relative">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          :placeholder="t('common.search')"
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all text-sm" />
      </div>
      
      <!-- Suggestions -->
      <ul
        v-if="searchQuery && suggestions.length"
        class="absolute z-20 w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl overflow-hidden">
        <li
          v-for="task in suggestions"
          :key="task.id"
          @click="selectSuggestion(task)"
          class="px-4 py-2.5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm">
          <span class="text-gray-900 dark:text-gray-100">{{ task.title }}</span>
        </li>
      </ul>
    </div>

    <!-- Filters Header (Desktop only or if search is hidden) -->
    <div v-if="!mobile || !showSearch" class="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold pb-2 border-b border-gray-200/50 dark:border-gray-700/50">
      <Filter class="w-4 h-4" />
      <span>{{ t('common.filters') }}</span>
    </div>

    <!-- Status Filter -->
    <div class="space-y-3">
      <button @click="toggleSection('status')" class="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <div class="flex items-center gap-2">
          <CheckSquare class="w-4 h-4" />
          <span>{{ t('tasks.status') }}</span>
        </div>
        <component :is="openSections.status ? ChevronUp : ChevronDown" class="w-4 h-4 opacity-50" />
      </button>
      
      <div v-if="openSections.status" class="space-y-2 pl-1 animate-fade-in">
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative flex items-center">
            <input type="checkbox" value="pending" v-model="selectedStatuses" class="peer sr-only" />
            <div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-indigo-400"></div>
            <svg class="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{{ t('common.pending') }}</span>
        </label>
        
        <label class="flex items-center gap-3 cursor-pointer group">
          <div class="relative flex items-center">
            <input type="checkbox" value="completed" v-model="selectedStatuses" class="peer sr-only" />
            <div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-indigo-400"></div>
            <svg class="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{{ t('common.completed') }}</span>
        </label>
      </div>
    </div>

    <!-- Priority Filter -->
    <div class="space-y-3">
      <button @click="toggleSection('priority')" class="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <div class="flex items-center gap-2">
          <Flag class="w-4 h-4" />
          <span>{{ t('tasks.priority') }}</span>
        </div>
        <component :is="openSections.priority ? ChevronUp : ChevronDown" class="w-4 h-4 opacity-50" />
      </button>
      
      <div v-if="openSections.priority" class="space-y-2 pl-1 animate-fade-in">
        <label v-for="priority in ['low', 'medium', 'high', 'urgent']" :key="priority" class="flex items-center gap-3 cursor-pointer group">
          <div class="relative flex items-center">
            <input type="checkbox" :value="priority" v-model="selectedPriorities" class="peer sr-only" />
            <div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-indigo-400"></div>
            <svg class="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors capitalize">{{ t(`tasks.${priority}`) }}</span>
        </label>
      </div>
    </div>

    <!-- Projects Filter -->
    <div class="space-y-3" v-if="projects.length > 0">
      <button @click="toggleSection('projects')" class="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <div class="flex items-center gap-2">
          <Folder class="w-4 h-4" />
          <span>{{ t('tasks.project') }}</span>
        </div>
        <component :is="openSections.projects ? ChevronUp : ChevronDown" class="w-4 h-4 opacity-50" />
      </button>
      
      <div v-if="openSections.projects" class="space-y-2 pl-1 animate-fade-in">
        <label v-for="project in projects" :key="project.id" class="flex items-center gap-3 cursor-pointer group">
          <div class="relative flex items-center">
            <input type="checkbox" :value="project.id" v-model="selectedProjectIds" class="peer sr-only" />
            <div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-indigo-400"></div>
            <svg class="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-2 h-2 rounded-full flex-shrink-0" :class="getProjectColorClass(project.color)"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors truncate">{{ project.title }}</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Tags Filter -->
    <div class="space-y-3" v-if="tags.length > 0">
      <button @click="toggleSection('tags')" class="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <div class="flex items-center gap-2">
          <Hash class="w-4 h-4" />
          <span>{{ t('tasks.tags') }}</span>
        </div>
        <component :is="openSections.tags ? ChevronUp : ChevronDown" class="w-4 h-4 opacity-50" />
      </button>
      
      <div v-if="openSections.tags" class="space-y-2 pl-1 animate-fade-in">
        <label v-for="tag in tags" :key="tag.id" class="flex items-center gap-3 cursor-pointer group">
          <div class="relative flex items-center">
            <input type="checkbox" :value="tag.id" v-model="selectedTagIds" class="peer sr-only" />
            <div class="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-indigo-400"></div>
            <svg class="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-md transition-colors" :class="getTagColorClass(tag.color)">{{ tag.name }}</span>
        </label>
      </div>
    </div>

    <!-- Deferred Actions (Apply/Clear) -->
    <div v-if="deferred" class="pt-6 mt-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
      <button 
        @click="clearFilters"
        class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        {{ t('common.clear') }}
      </button>
      <button 
        @click="applyFilters"
        class="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
        {{ t('common.create') }}
      </button>
    </div>

  </aside>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
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
