<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Construction } from "lucide-vue-next";

const { t } = useI18n();
</script>

<template>
  <div
    class="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
    <div class="max-w-2xl w-full text-center space-y-8">
      <!-- Icon -->
      <div class="flex justify-center">
        <div
          class="w-32 h-32 rounded-full bg-amber-500/10 border-4 border-amber-500/30 flex items-center justify-center animate-pulse">
          <Construction class="w-16 h-16 text-amber-500" />
        </div>
      </div>

      <!-- Title -->
      <div class="space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold text-white">
          {{ t("maintenance.title") }}
        </h1>
        <p class="text-xl text-gray-300">
          {{ t("maintenance.message") }}
        </p>
      </div>

      <!-- Details -->
      <div
        class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-4">
        <div class="flex items-center justify-center gap-3 text-gray-400">
          <div class="flex gap-2">
            <div
              class="w-3 h-3 rounded-full bg-amber-500 animate-bounce"
              style="animation-delay: 0ms"></div>
            <div
              class="w-3 h-3 rounded-full bg-amber-500 animate-bounce"
              style="animation-delay: 150ms"></div>
            <div
              class="w-3 h-3 rounded-full bg-amber-500 animate-bounce"
              style="animation-delay: 300ms"></div>
          </div>
          <span class="text-lg">{{ t("maintenance.back_soon") }}</span>
        </div>

        <p class="text-gray-400 text-sm">
          {{ t("maintenance.contact") }}
        </p>
      </div>

      <!-- Footer -->
      <div class="text-gray-500 text-sm">
        &copy; {{ new Date().getFullYear() }} TaskFlow
      </div>
    </div>
  </div>
</template>
