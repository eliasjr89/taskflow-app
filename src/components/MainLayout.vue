<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Navbar from "./Navbar.vue";
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
    <Navbar />
    <div class="flex flex-1 gap-6 p-6">
      <Sidebar />
      <main class="flex-1 flex flex-col items-center">
        <slot />
      </main>
    </div>
  </div>
</template>
