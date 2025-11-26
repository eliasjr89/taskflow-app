<script setup lang="ts">
import { onMounted } from "vue";
import { useTaskState } from "./composables/useTaskState";
import { useTasks } from "./composables/useTask";

import AddTaskForm from "./components/AddTaskForm.vue";
import TaskList from "./components/TaskList.vue";
import MainLayout from "./components/MainLayout.vue";

const { pendingTasks, completedTasks } = useTaskState();
const { loadTask } = useTasks();

onMounted(loadTask);
</script>

<template>
  <MainLayout>
    <!-- Formulario de nueva tarea -->
    <AddTaskForm
      class="w-full max-w-md mb-8 backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-transform duration-300" />

    <!-- Listas de tareas -->
    <div class="w-full max-w-md space-y-8">
      <!-- Tareas pendientes -->
      <div class="animate-fadeInUp">
        <template v-if="pendingTasks.length">
          <h2
            class="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Pending Tasks
          </h2>
          <TaskList
            :tasks="pendingTasks"
            class="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-2xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300" />
        </template>

        <template v-else>
          <div class="text-center text-gray-600 dark:text-gray-300 p-4">
            <p>No hay tareas pendientes. ¡Agrega una nueva tarea!</p>
          </div>
        </template>
      </div>
      <!-- Tareas completadas -->
      <div v-if="completedTasks.length" class="animate-fadeInUp delay-150">
        <h2 class="text-2xl font-semibold mb-4">Completed Tasks</h2>
        <TaskList
          :tasks="completedTasks"
          class="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-2xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300" />
      </div>

      <!-- Mensaje si no hay tareas completadas -->
      <div
        v-else
        class="animate-fadeInUp delay-150 text-gray-600 dark:text-gray-300 text-center">
        <p>No hay tareas completadas</p>
      </div>
    </div>
  </MainLayout>
</template>
