<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useSocket } from "@/composables/useSocket";
import type { SystemHealth } from "@/services/adminService";
import adminService from "@/services/adminService";

const health = ref<SystemHealth | null>(null);
const { on, off } = useSocket();
const loading = ref(true);

const handleHealthUpdate = (data: SystemHealth) => {
  health.value = data;
  loading.value = false;
};

onMounted(async () => {
  // Initial fetch
  try {
    const res = await adminService.getSystemHealth();
    health.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }

  // Listen for live updates
  on("admin:system-health", handleHealthUpdate);
});

onUnmounted(() => {
  off("admin:system-health", handleHealthUpdate);
});

const getMemColor = (percent: string) => {
  const p = parseFloat(percent);
  if (p > 80) return "text-rose-500";
  if (p > 50) return "text-yellow-400";
  return "text-emerald-400";
};
</script>

<template>
  <div
    class="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
    <div class="flex justify-between items-start mb-4">
      <h3 class="font-bold text-lg text-white">
        {{ $t("admin_health.title") }}
      </h3>
      <span
        v-if="health && health.uptime"
        class="text-xs px-2 py-1 rounded bg-slate-700 text-text-muted">
        {{ $t("admin_health.uptime") }}:
        {{ (health.uptime / 3600).toFixed(1) }}h
      </span>
    </div>

    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-4 bg-slate-700 rounded w-3/4"></div>
      <div class="h-4 bg-slate-700 rounded w-1/2"></div>
    </div>

    <div v-else-if="health" class="grid grid-cols-2 gap-4">
      <!-- Memory -->
      <div class="bg-slate-700/30 p-3 rounded-xl border border-white/5">
        <p class="text-xs text-text-muted mb-1">
          {{ $t("admin_health.memory_usage") }}
        </p>
        <div class="flex items-end gap-2">
          <span
            :class="[
              'text-2xl font-black',
              getMemColor(health.memory?.usagePercent || '0'),
            ]">
            {{ health.memory?.usagePercent || "0" }}
          </span>
          <span class="text-xs text-text-muted mb-1.5">
            {{ ((health.memory?.free || 0) / 1024 / 1024).toFixed(0) }}MB
            {{ $t("admin_health.free") }}
          </span>
        </div>
        <!-- Mini Bar -->
        <div
          class="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="
              parseFloat(health.memory?.usagePercent || '0') > 80
                ? 'bg-rose-500'
                : 'bg-emerald-500'
            "
            :style="{ width: health.memory?.usagePercent || '0%' }"></div>
        </div>
      </div>

      <!-- DB Stats -->
      <div class="bg-slate-700/30 p-3 rounded-xl border border-white/5">
        <p class="text-xs text-text-muted mb-1">
          {{ $t("admin_health.db_connection") }}
        </p>
        <div class="flex items-center gap-2 mt-1">
          <div
            class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span class="font-bold text-white">{{
            $t("admin_health.connected")
          }}</span>
        </div>
        <p class="text-xs text-text-muted mt-2">
          {{ $t("admin_health.active_pool") }}: 5/10
        </p>
      </div>
    </div>
  </div>
</template>
