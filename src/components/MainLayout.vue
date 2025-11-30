<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";
import type { Task } from "../types/global";

const props = defineProps<{ tasks: Task[] }>();

const emit = defineEmits<{
  (e: "filter", value: "all" | "pending" | "completed"): void;
  (e: "search", value: string): void;
  (e: "selectTask", task: Task): void;
}>();

function forwardFilter(value: "all" | "pending" | "completed") {
  emit("filter", value);
}

function forwardSearch(value: string) {
  emit("search", value);
}

function forwardSelectTask(task: Task) {
  emit("selectTask", task);
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-500">
    <Navbar />

    <div class="flex flex-1 flex-col md:flex-row gap-6 p-4 md:p-8">
      <Sidebar
        @filter="forwardFilter"
        @search="forwardSearch"
        @selectTask="forwardSelectTask"
        :tasks="props.tasks" />
      <main class="flex-1 flex flex-col items-center w-full md:max-w-3xl mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
