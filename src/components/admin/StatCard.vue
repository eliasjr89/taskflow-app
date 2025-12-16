<script setup lang="ts">
import { computed } from "vue";
import CountUp from "@/components/CountUp.vue";

const props = defineProps<{
  label: string;
  value: string | number;
  icon: string;
  color?: string; // e.g. 'text-primary'
  bgGradient?: string; // e.g. 'from-blue-500 to-cyan-500'
}>();

const numericValue = computed(() => {
  if (typeof props.value === "number") return props.value;
  const parsed = parseFloat(props.value as string);
  return isNaN(parsed) ? null : parsed;
});
</script>

<template>
  <div
    class="bg-slate-800/70 border border-white/10 rounded-xl shadow-sm p-6 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
    <div>
      <h3 class="text-4xl font-bold mb-1 font-mono text-white">
        <CountUp v-if="numericValue !== null" :to="numericValue" />
        <span v-else>{{ value }}</span>
      </h3>
      <p class="text-text-muted text-sm uppercase tracking-wider font-semibold">
        {{ label }}
      </p>
    </div>
    <div
      :class="`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg bg-linear-to-br ${
        bgGradient || 'from-white/10 to-white/5'
      } text-white`">
      <i :class="['fa-solid', icon]"></i>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>
