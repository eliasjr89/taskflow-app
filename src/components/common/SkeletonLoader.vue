<script setup lang="ts">
defineProps<{
  type?: "card" | "table" | "list" | "text" | "banner";
  count?: number;
}>();
</script>

<template>
  <div class="animate-pulse w-full">
    <!-- Banner Skeleton -->
    <div
      v-if="type === 'banner'"
      class="w-full h-[160px] bg-white/5 dark:bg-white/5 rounded-3xl mb-8"></div>

    <!-- Card Grid Skeleton -->
    <div
      v-if="type === 'card'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in count || 3"
        :key="i"
        class="bg-white/5 dark:bg-white/5 rounded-2xl h-48 w-full border border-white/5">
        <div class="p-6 space-y-4">
          <div class="flex justify-between">
            <div class="w-12 h-12 bg-white/10 rounded-lg"></div>
            <div class="w-8 h-8 bg-white/10 rounded-full"></div>
          </div>
          <div class="h-6 bg-white/10 rounded w-3/4"></div>
          <div class="space-y-2 pt-4">
            <div class="h-2 bg-white/10 rounded-full w-full"></div>
            <div class="flex justify-between">
              <div class="h-3 w-10 bg-white/10 rounded"></div>
              <div class="h-3 w-10 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Rows Skeleton -->
    <div v-if="type === 'table'" class="space-y-3">
      <div class="flex gap-4 mb-4">
        <div class="w-1/4 h-8 bg-white/10 rounded-lg"></div>
        <div class="w-1/4 h-8 bg-white/10 rounded-lg"></div>
        <div
          class="w-full h-8 bg-white/5 rounded-lg border border-white/5"></div>
      </div>
      <div
        v-for="i in count || 5"
        :key="i"
        class="h-16 bg-white/5 dark:bg-white/5 rounded-xl w-full border border-white/5 flex items-center px-4 gap-4">
        <div class="w-8 h-8 rounded-full bg-white/10"></div>
        <div class="w-1/3 h-4 bg-white/10 rounded"></div>
        <div class="w-1/4 h-4 bg-white/10 rounded"></div>
        <div class="w-20 h-6 bg-white/10 rounded-full ml-auto"></div>
      </div>
    </div>

    <!-- List Skeleton -->
    <div v-if="type === 'list'" class="space-y-4">
      <div
        v-for="i in count || 4"
        :key="i"
        class="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
        <div class="w-12 h-12 bg-white/10 rounded-lg"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-white/10 rounded w-1/3"></div>
          <div class="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Text Block Skeleton -->
    <div v-if="type === 'text'" class="space-y-3">
      <div class="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
      <div class="h-4 bg-white/10 rounded w-full"></div>
      <div class="h-4 bg-white/10 rounded w-full"></div>
      <div class="h-4 bg-white/10 rounded w-2/3"></div>
    </div>
  </div>
</template>
