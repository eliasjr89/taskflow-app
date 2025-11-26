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
    class="flex gap-2 bg-white p-4 rounded shadow-md">
    <input
      id="new-task"
      type="text"
      v-model="newTask"
      placeholder="Agregar nueva tarea..."
      class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
    <button
      type="submit"
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
      Add
    </button>
  </form>
</template>
