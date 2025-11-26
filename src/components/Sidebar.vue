<script setup lang="ts">
import { ref, computed } from "vue";
import type { Task } from "../types/global";

const props = defineProps<{ tasks: Task[] }>();

const active = ref<"all" | "pending" | "completed">("all");
const searchQuery = ref("");

// Emitimos al padre
const emit = defineEmits<{
  (e: "filter", value: "all" | "pending" | "completed"): void;
  (e: "search", value: string): void;
  (e: "selectTask", task: Task): void;
}>();

// Autocompletado basado en todas las tareas
const suggestions = computed(() =>
  props.tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

function selectFilter(value: "all" | "pending" | "completed") {
  active.value = value;
  emit("filter", value);
}

function onSearch(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  searchQuery.value = value;
  emit("search", value);
}

function selectSuggestion(task: Task) {
  searchQuery.value = task.title;
  emit("search", task.title);
  emit("selectTask", task);
}
</script>

<template>
  <aside
    class="hidden md:flex flex-col w-64 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-lg gap-3 relative">
    <!-- Buscador -->
    <div class="relative">
      <input
        type="text"
        placeholder="Buscar tareas..."
        v-model="searchQuery"
        @input="onSearch"
        class="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
      <ul
        v-if="searchQuery && suggestions.length"
        class="absolute z-20 w-full mt-1 max-h-48 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-md">
        <li
          v-for="task in suggestions"
          :key="task.id"
          @click="selectSuggestion(task)"
          class="px-2 py-1 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-700 transition">
          {{ task.title }}
        </li>
      </ul>
    </div>

    <!-- Filtros -->
    <button
      @click="selectFilter('all')"
      :class="[
        'p-2 rounded transition text-left w-full cursor-pointer',
        active === 'all'
          ? 'bg-indigo-500 text-white'
          : 'hover:bg-indigo-100 dark:hover:bg-indigo-700',
      ]">
      Todas
    </button>

    <button
      @click="selectFilter('pending')"
      :class="[
        'p-2 rounded transition text-left w-full cursor-pointer',
        active === 'pending'
          ? 'bg-indigo-500 text-white'
          : 'hover:bg-indigo-100 dark:hover:bg-indigo-700',
      ]">
      Pendientes
    </button>

    <button
      @click="selectFilter('completed')"
      :class="[
        'p-2 rounded transition text-left w-full cursor-pointer',
        active === 'completed'
          ? 'bg-indigo-500 text-white'
          : 'hover:bg-indigo-100 dark:hover:bg-indigo-700',
      ]">
      Completadas
    </button>
  </aside>
</template>
