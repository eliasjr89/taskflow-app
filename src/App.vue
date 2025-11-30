<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useTaskState } from "./composables/useTaskState";
import { useTasks } from "./composables/useTask";

import AddTaskForm from "./components/AddTaskForm.vue";
import TaskList from "./components/TaskList.vue";
import MainLayout from "./components/MainLayout.vue";

const { pendingTasks, completedTasks, tasks } = useTaskState();
const { loadTask } = useTasks();

onMounted(loadTask);

// Estado local para filtros y búsqueda
const activeFilter = ref<"all" | "pending" | "completed">("all");
const searchQuery = ref("");
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
function handleFilter(value: "all" | "pending" | "completed") {
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
  <MainLayout
    :tasks="tasks"
    @filter="handleFilter"
    @search="handleSearch"
    @selectTask="handleSelectTask">
    <!-- Formulario de nueva tarea -->
    <AddTaskForm class="w-full max-w-md mb-8" />

    <!-- Lista de tareas filtradas -->
    <div class="w-full max-w-md space-y-8">
      <!-- Pendientes -->
      <div
        v-if="activeFilter === 'all' || activeFilter === 'pending'"
        class="animate-fadeInUp">
        <template v-if="filteredPendingTasks.length">
          <h2
            class="text-2xl font-bold mb-5 text-gray-800 dark:text-gray-100">
            📝 Tareas pendientes
          </h2>
          <TaskList
            :tasks="filteredPendingTasks"
            :selectedTaskId="selectedTask?.id"
            class="space-y-3" />
        </template>
        <template v-else>
          <div class="text-center text-gray-600 dark:text-gray-300 p-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-200/30 dark:border-gray-700/30">
            <p class="text-lg">✨ No hay tareas pendientes. ¡Agrega una nueva tarea!</p>
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
            ✅ Tareas completadas
          </h2>
          <TaskList
            :tasks="filteredCompletedTasks"
            :selectedTaskId="selectedTask?.id"
            class="space-y-3" />
        </template>
        <template v-else>
          <div class="text-center text-gray-600 dark:text-gray-300 p-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-200/30 dark:border-gray-700/30">
            <p class="text-lg">🎯 No hay tareas completadas</p>
          </div>
        </template>
      </div>
    </div>
  </MainLayout>
</template>
