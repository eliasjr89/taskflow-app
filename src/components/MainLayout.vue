<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";

// Reenviamos eventos al padre
const emit = defineEmits<{
  (e: "filter", value: "all" | "pending" | "completed"): void;
  (e: "search", value: string): void;
  (e: "selectTask", task: any): void;
}>();

function forwardFilter(value: "all" | "pending" | "completed") {
  emit("filter", value);
}

function forwardSearch(value: string) {
  emit("search", value);
}

function forwardSelectTask(task: any) {
  emit("selectTask", task);
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
    <Navbar />

    <div class="flex flex-1 gap-6 p-6">
      <Sidebar
        @filter="forwardFilter"
        @search="forwardSearch"
        @selectTask="forwardSelectTask"
        :tasks="$slots.default ? [] : []" />

      <main class="flex-1 flex flex-col items-center">
        <slot />
      </main>
    </div>
  </div>
</template>
