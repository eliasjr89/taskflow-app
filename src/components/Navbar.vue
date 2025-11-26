<script setup lang="ts">
import { useTheme } from "../composables/usThemes";

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <nav
    class="flex justify-between items-center px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-md sticky top-0 z-10">
    <h1
      class="text-2xl font-bold text-gray-900 dark:text-gray-100 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none">
      TaskFlow
    </h1>

    <button
      @click="toggleTheme"
      aria-label="Toggle theme"
      class="ml-auto md:ml-0 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
      <span v-if="isDark">🌙</span>
      <span v-else>☀️</span>
    </button>
  </nav>
</template>
