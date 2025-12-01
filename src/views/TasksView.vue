<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTaskState } from '../composables/useTaskState';
import { useTasks } from '../composables/useTask';
import { useI18n } from 'vue-i18n';

import AddTaskForm from '../components/AddTaskForm.vue';
import TaskList from '../components/TaskList.vue';
import Sidebar from '../components/Sidebar.vue';

const { t } = useI18n();
const { pendingTasks, completedTasks, tasks } = useTaskState();
const { loadTask } = useTasks();

onMounted(loadTask);

// Estado local para filtros y búsqueda
const activeFilter = ref<'all' | 'pending' | 'completed'>('all');
const searchQuery = ref('');
const selectedTask = ref<(typeof tasks.value)[0] | null>(null);

// Computed: listas filtradas según filtro y búsqueda
const filteredPendingTasks = computed(() =>
  pendingTasks.value.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const filteredCompletedTasks = computed(() =>
  completedTasks.value.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

// Funciones para recibir eventos del Sidebar
function handleFilter(value: 'all' | 'pending' | 'completed') {
  activeFilter.value = value;
}

function handleSearch(value: string) {
  searchQuery.value = value;
}

function handleSelectTask(task: (typeof tasks.value)[0]) {
  selectedTask.value = task;
}
</script>

<template>
  <div class="flex flex-1 flex-col md:flex-row gap-6">
    <Sidebar
      @filter="handleFilter"
      @search="handleSearch"
      @selectTask="handleSelectTask"
      :tasks="tasks" />
    
    <div class="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col gap-2 mb-8">
        <h1 class="text-3xl md:text-4xl font-bold font-heading flex items-center gap-2">
          <span>✅</span>
          <span class="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{{ t('tasks.title') }}</span>
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">{{ t('tasks.subtitle') }}</p>
      </div>

      <!-- Formulario de nueva tarea -->
      <AddTaskForm class="w-full mb-8" />

      <!-- Lista de tareas filtradas -->
      <div class="w-full space-y-8">
        <!-- Pendientes -->
        <div
          v-if="activeFilter === 'all' || activeFilter === 'pending'"
          class="animate-fadeInUp">
          <template v-if="filteredPendingTasks.length">
            <h2
              class="text-2xl font-bold mb-5 text-gray-800 dark:text-gray-100">
              📝 {{ t('tasks.pending_title') }}
            </h2>
            <TaskList
              :tasks="filteredPendingTasks"
              :selectedTaskId="selectedTask?.id"
              class="space-y-3" />
          </template>
          <template v-else>
           <div class="glass-card text-center text-gray-600 dark:text-gray-300 p-8 rounded-2xl">
              <p class="text-lg">{{ t('tasks.no_tasks') }}</p>
            </div>
          </template>
        </div>

        <!-- Completadas -->
        <div
          v-if="activeFilter === 'all' || activeFilter === 'completed'"
          class="animate-fadeInUp delay-150">
          <template v-if="filteredCompletedTasks.length">
            <h2
              class="text-2xl font-bold mb-5 text-gray-800 dark:text-gray-100">
              ✅ {{ t('tasks.completed_title') }} 
            </h2>
            <TaskList
              :tasks="filteredCompletedTasks"
              :selectedTaskId="selectedTask?.id"
              class="space-y-3" />
          </template>
          <template v-else>
            <div class="glass-card text-center text-gray-600 dark:text-gray-300 p-8 rounded-2xl">
              <p class="text-lg">🎯 {{ t('tasks.no_completed_tasks') }}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
