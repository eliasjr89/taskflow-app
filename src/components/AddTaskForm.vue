<script setup lang="ts">
import { ref } from "vue";
import { useTasks } from "../composables/useTask";

const newTask = ref("");
const { addTask } = useTasks();

function handleSubmit() {
  const trimmed = newTask.value.trim();
  if (!trimmed) return;

  addTask(trimmed);
  newTask.value = "";
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="flex gap-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-4 rounded-2xl shadow-md hover:scale-[1.02] transition-transform duration-300 w-full max-w-md">
    <input
      id="new-task"
      type="text"
      v-model="newTask"
      placeholder="Agregar nueva tarea..."
      class="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
    <button
      type="submit"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition">
      Agregar
    </button>
  </form>
</template>
