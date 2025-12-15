<script setup lang="ts">
import Navbar from "./Navbar.vue";
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
      <Navbar v-if="!isPublic" />

      <div
        class="flex flex-1 flex-col md:flex-row gap-6 w-full"
        :class="{ 'p-4 md:p-6 pb-24 md:pb-6': !isPublic }">
        <AppSidebar v-if="!isPublic" />

        <main class="flex-1 flex flex-col w-full min-w-0">
          <slot />
        </main>
      </div>

      <BottomNav v-if="!isPublic" />
    </div>
  </div>
</template>
