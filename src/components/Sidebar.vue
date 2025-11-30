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
    class="md:hidden p-3 fixed top-4 left-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg z-50 shadow-lg transition-all duration-200"
    @click="toggleSidebar">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <aside
    :class="[
      'flex flex-col w-72 p-5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl gap-4 transition-all duration-300 fixed md:static z-40 h-full md:h-auto border border-gray-200/30 dark:border-gray-700/30 shadow-lg',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]">
    <div class="relative">
      <input
        type="text"
        placeholder="Buscar tareas..."
        v-model="searchQuery"
        @input="onSearch"
        class="w-full px-4 py-2.5 rounded-lg border border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
      <ul
        v-if="searchQuery && suggestions.length"
        class="absolute z-20 w-full mt-2 max-h-48 overflow-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl">
        <li
          v-for="task in suggestions"
          :key="task.id"
          @click="selectSuggestion(task)"
          class="px-4 py-2.5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0">
          <span class="text-gray-900 dark:text-gray-100">{{ task.title }}</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-col gap-2">
      <button
        @click="selectFilter('all')"
        :class="[
          'px-4 py-2.5 rounded-lg transition-all text-left w-full font-medium',
          active === 'all'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        ]">
        Todas
      </button>
      <button
        @click="selectFilter('pending')"
        :class="[
          'px-4 py-2.5 rounded-lg transition-all text-left w-full font-medium',
          active === 'pending'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        ]">
        Pendientes
      </button>
      <button
        @click="selectFilter('completed')"
        :class="[
          'px-4 py-2.5 rounded-lg transition-all text-left w-full font-medium',
          active === 'completed'
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        ]">
        Completadas
      </button>
    </div>
  </aside>

  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
    @click="toggleSidebar"></div>
</template>
