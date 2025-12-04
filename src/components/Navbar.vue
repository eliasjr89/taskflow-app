<script setup lang="ts">
import { useTheme } from "../composables/usThemes";
import { useI18n } from 'vue-i18n';
import { Languages } from 'lucide-vue-next';

const { isDark, toggleTheme } = useTheme();
const { locale } = useI18n();

const toggleLanguage = () => {
  locale.value = locale.value === 'es' ? 'en' : 'es';
};
</script>

<template>
  <nav
    class="flex justify-center gap-4 items-center px-6 py-4 bg-white/20 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-10 shadow-sm">
    <h1 class="text-3xl font-bold text-gray-900 dark:bg-gradient-to-r dark:from-indigo-400 dark:to-purple-400 dark:bg-clip-text dark:text-transparent font-heading whitespace-nowrap mr-auto">
      TaskFlow
    </h1>

    <!-- Language Toggle -->
    <button
      @click="toggleLanguage"
      class="p-2.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2 font-medium text-sm text-gray-700 dark:text-gray-300"
      title="Cambiar idioma / Change language">
      <Languages class="w-5 h-5" />
      <span>{{ locale === 'es' ? 'EN' : 'ES' }}</span>
    </button>

    <button
      @click="toggleTheme"
      aria-label="Toggle theme"
      class="p-2.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 group">
      <!-- Sol (modo claro) -->
      <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500 group-hover:rotate-45 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <!-- Luna (modo oscuro) -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  </nav>
</template>
