<script setup lang="ts">
import { useTheme } from "../composables/usThemes";

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <nav
    class="flex justify-between items-center p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-md sticky top-0 z-10">
    <h1 class="text-2xl font-bold">TaskFlow</h1>
    <button
      @click="toggleTheme"
      class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
      <span v-if="isDark">🌙</span>
      <span v-else>☀️</span>
    </button>
  </nav>
</template>
