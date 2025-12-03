<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTaskState } from '../composables/useTaskState';
import { useTasks } from '../composables/useTask';
import { useI18n } from 'vue-i18n';
import type { FilterState } from '../types/global';
import { Filter } from 'lucide-vue-next';

import AddTaskForm from '../components/AddTaskForm.vue';
import TaskList from '../components/TaskList.vue';
import Sidebar from '../components/Sidebar.vue';
import TaskDetailModal from '../components/TaskDetailModal.vue';
import CountUp from '../components/CountUp.vue';

const { t } = useI18n();
const { tasks } = useTaskState();
const { loadTask } = useTasks();

// Filters state
const activeFilters = ref<FilterState>({
  search: '',
  statuses: [],
  priorities: [],
  projectIds: [],
  tagIds: []
});

const isModalOpen = ref(false);
const isMobileFiltersOpen = ref(false);
const selectedTask = ref<(typeof tasks.value)[0] | null>(null);

onMounted(loadTask);

// Advanced Filtering Logic
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    // 1. Search Filter
    if (activeFilters.value.search && !task.title.toLowerCase().includes(activeFilters.value.search.toLowerCase())) {
      return false;
    }

    // 2. Status Filter
    if (activeFilters.value.statuses.length > 0) {
      const status = task.completed ? 'completed' : 'pending';
      if (!activeFilters.value.statuses.includes(status)) {
        return false;
      }
    }

    // 3. Priority Filter
    if (activeFilters.value.priorities.length > 0) {
      if (!task.priority || !activeFilters.value.priorities.includes(task.priority)) {
        return false;
      }
    }

    // 4. Project Filter
    if (activeFilters.value.projectIds.length > 0) {
      if (!task.projectId || !activeFilters.value.projectIds.includes(task.projectId.toString())) {
        return false;
      }
    }

    // 5. Tag Filter
    if (activeFilters.value.tagIds.length > 0) {
      if (!task.tags || !task.tags.some(tagId => activeFilters.value.tagIds.includes(tagId.toString()))) {
        return false;
      }
    }

    return true;
  });
});

// Derived lists for display
const displayPendingTasks = computed(() => 
  filteredTasks.value
    .filter(t => !t.completed)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
);

const displayCompletedTasks = computed(() => 
  filteredTasks.value
    .filter(t => t.completed)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
);

// Event Handlers
function handleFilterUpdate(filters: FilterState) {
  activeFilters.value = filters;
}

function handleSelectTask(task: (typeof tasks.value)[0]) {
  selectedTask.value = task;
  isModalOpen.value = true;
}
</script>

<template>
  <div class="flex flex-1 flex-col md:flex-row gap-6 animate-fade-in relative">
    <!-- Desktop Sidebar -->
    <Sidebar
      class="hidden md:flex"
      :tasks="tasks"
      :deferred="true"
      @update:filters="handleFilterUpdate"
      @selectTask="handleSelectTask" />

    <!-- Mobile Filter Drawer -->
    <div 
      v-if="isMobileFiltersOpen" 
      class="fixed inset-0 z-50 md:hidden"
    >
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        @click="isMobileFiltersOpen = false"
      ></div>
      
      <!-- Drawer -->
      <div class="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out">
        <Sidebar
          :tasks="tasks"
          :mobile="true"
          :show-search="false"
          :deferred="true"
          @update:filters="handleFilterUpdate"
          @selectTask="handleSelectTask"
          @close="isMobileFiltersOpen = false"
        />
      </div>
    </div>
    
    <div class="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col gap-2 mb-6">
        <h1 class="text-3xl md:text-4xl font-bold font-heading flex items-center gap-2">
          📝
          <span class="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{{ t('tasks.title') }}</span>
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">{{ t('tasks.subtitle') }}</p>
      </div>

      <!-- Mobile Filters Button -->
      <div class="md:hidden mb-6 flex gap-2">
        <div class="relative flex-1">
          <input
            type="text"
            :placeholder="t('common.search')"
            v-model="activeFilters.search"
            class="w-full px-4 py-3 rounded-xl border border-gray-300/50 dark:border-gray-600/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
        </div>
        <button 
          @click="isMobileFiltersOpen = true"
          class="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300/50 dark:border-gray-600/50 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Filter class="w-5 h-5" />
        </button>
      </div>

      <!-- Add Task Form -->
      <AddTaskForm class="mb-6" />

      <div class="space-y-6">
        <!-- Pending Tasks -->
        <div v-if="displayPendingTasks.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold flex items-center gap-2">
              <span>📝</span>
              <span class="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {{ t('tasks.pending_title') }}
              </span>
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
              <CountUp :to="displayPendingTasks.length" />
            </span>
          </div>
          <TaskList :tasks="displayPendingTasks" @select-task="handleSelectTask" />
        </div>
        
        <!-- Completed Tasks -->
        <div v-if="displayCompletedTasks.length > 0" class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold flex items-center gap-2">
              <span>✅</span>
              <span class="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {{ t('tasks.completed_title') }}
              </span>
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
              <CountUp :to="displayCompletedTasks.length" />
            </span>
          </div>
          <TaskList :tasks="displayCompletedTasks" @select-task="handleSelectTask" />
        </div>

        <!-- No Tasks Empty State -->
        <div v-if="displayPendingTasks.length === 0 && displayCompletedTasks.length === 0" class="glass-card rounded-2xl p-8 text-center text-gray-600 dark:text-gray-300">
          <p class="text-lg">{{ t('tasks.no_tasks') }}</p>
        </div>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <TaskDetailModal
      :task="selectedTask"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
