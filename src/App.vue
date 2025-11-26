<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useTaskState } from "./composables/useTaskState";
import { useTasks } from "./composables/useTask";

import AddTaskForm from "./components/AddTaskForm.vue";
import TaskList from "./components/TaskList.vue";
import MainLayout from "./components/MainLayout.vue";

const { pendingTasks, completedTasks } = useTaskState();
const { loadTask } = useTasks();

onMounted(loadTask);

// filtro actual
const selectedFilter = ref<"all" | "pending" | "completed">("all");

function handleFilter(filter: "all" | "pending" | "completed") {
  selectedFilter.value = filter;
}

// lista filtrada
const filteredTasks = computed(() => {
  if (selectedFilter.value === "pending") return pendingTasks.value;
  if (selectedFilter.value === "completed") return completedTasks.value;
  return [...pendingTasks.value, ...completedTasks.value];
});
</script>

<template>
  <MainLayout @filter="handleFilter">
    <AddTaskForm
      class="w-full max-w-md mb-8 backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition-transform" />

    <div class="w-full max-w-md space-y-8 animate-fadeInUp">
      <template v-if="filteredTasks.length">
        <h2 class="text-2xl font-semibold mb-4 capitalize">
          {{ selectedFilter }} Tasks
        </h2>

        <TaskList
          :tasks="filteredTasks"
          class="backdrop-blur-md bg-white/30 dark:bg-gray-800/30 rounded-2xl p-4 shadow-md hover:shadow-xl" />
      </template>

      <template v-else>
        <div class="text-center text-gray-600 dark:text-gray-300 p-4">
          <p v-if="selectedFilter === 'all'">
            No tienes tareas aún. ¡Agrega una!
          </p>
          <p v-else-if="selectedFilter === 'pending'">
            No hay tareas pendientes.
          </p>
          <p v-else>No hay tareas completadas.</p>
        </div>
      </template>
    </div>
  </MainLayout>
</template>
