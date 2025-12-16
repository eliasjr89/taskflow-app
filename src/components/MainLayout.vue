<script setup lang="ts">
import Header from "./Header.vue";
import AppSidebar from "./AppSidebar.vue";
import BottomNav from "./BottomNav.vue";
import DynamicBackground from "./DynamicBackground.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const isPublic = computed(() => route.meta.public === true);
</script>

<template>
  <div
    class="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-500 relative">
    <DynamicBackground />

    <div class="relative z-10 flex flex-col min-h-screen">
      <!-- Layout Container -->
      <div
        class="flex flex-1 flex-col md:flex-row gap-0 w-full"
        :class="{ 'p-0 md:p-0': !isPublic }">
        <!-- Removed standard padding to let Sidebar/Header handle spacing like Admin -->

        <AppSidebar v-if="!isPublic" />

        <main
          class="flex-1 flex flex-col w-full min-w-0 px-4 md:px-8 pb-24 md:pb-8 h-screen overflow-y-auto no-scrollbar">
          <!-- Header Banner inside Main -->
          <Header v-if="!isPublic" />

          <!-- Content -->
          <div class="fade-in">
            <slot />
          </div>
        </main>
      </div>

      <BottomNav v-if="!isPublic" />
    </div>
  </div>
</template>
