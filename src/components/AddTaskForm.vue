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
    class="flex gap-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-md border border-gray-200/30 dark:border-gray-700/30">
    <input
      id="new-task"
      type="text"
      v-model="newTask"
      placeholder="Agregar nueva tarea..."
      class="flex-1 border border-gray-300/50 dark:border-gray-600/50 rounded-lg px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
    <button
      type="submit"
      class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      <span>Agregar</span>
    </button>
  </form>
</template>
