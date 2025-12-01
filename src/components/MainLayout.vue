<script setup lang="ts">
import Navbar from './Navbar.vue';
import AppSidebar from './AppSidebar.vue';
import BottomNav from './BottomNav.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-500">
    <Navbar />

    <div class="flex flex-1 flex-col md:flex-row gap-6 p-4 md:p-6 w-full pb-24 md:pb-6">
      <AppSidebar />
      
      <main class="flex-1 flex flex-col w-full min-w-0">
        <slot />
      </main>
    </div>

    <BottomNav />
  </div>
</template>
