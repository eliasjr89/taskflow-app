<script setup lang="ts">
import { ref, computed } from "vue";
import type { Task } from "../types/global";

const props = defineProps<{ tasks: Task[] }>();
const emit = defineEmits<{
  (e: "filter", value: "all" | "pending" | "completed"): void;
  (e: "search", value: string): void;
  (e: "selectTask", task: Task): void;
}>();

const active = ref<"all" | "pending" | "completed">("all");
const searchQuery = ref("");
const isOpen = ref(false);

const suggestions = computed(() =>
  props.tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

function selectFilter(value: "all" | "pending" | "completed") {
  active.value = value;
  emit("filter", value);
  if (window.innerWidth < 768) isOpen.value = false;
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
  if (window.innerWidth < 768) isOpen.value = false;
}

function toggleSidebar() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <button
    class="md:hidden p-2 fixed top-4 left-4 bg-indigo-500 text-white rounded z-50 shadow-md"
    @click="toggleSidebar">
    ☰
  </button>

  <aside
    :class="[
      'flex flex-col w-64 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-lg gap-3 transition-transform duration-300 fixed md:static z-40 h-full md:h-auto',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]">
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

  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/30 z-30 md:hidden"
    @click="toggleSidebar"></div>
</template>
