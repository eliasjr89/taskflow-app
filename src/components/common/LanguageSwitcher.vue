<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

defineProps<{
  fixed?: boolean;
}>();

const { locale } = useI18n();

const toggleLanguage = () => {
  const newLang = locale.value === "es" ? "en" : "es";
  locale.value = newLang;
  localStorage.setItem("locale", newLang);
};

// Labels
const currentLabel = computed(() => (locale.value === "es" ? "ES" : "EN"));
</script>

<template>
  <button
    @click="toggleLanguage"
    type="button"
    :class="[
      'flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 border backdrop-blur-md shadow-lg group z-50',
      fixed
        ? 'fixed top-6 right-6 bg-white/10 border-white/20 text-white hover:bg-white/20'
        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 relative',
    ]">
    <i
      class="fa-solid fa-globe text-indigo-400 group-hover:text-indigo-300 transition-colors"></i>
    <span>{{ currentLabel }}</span>
    <!-- Animated Divider -->
    <span class="w-px h-3 bg-white/20 mx-0.5"></span>
    <span
      class="opacity-50 group-hover:opacity-100 transition-opacity text-[10px]">
      {{ locale === "es" ? "EN" : "ES" }}
    </span>
  </button>
</template>
