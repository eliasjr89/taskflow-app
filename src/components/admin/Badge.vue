<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  type?: "status" | "priority" | "role" | "default";
  value: string;
}>();

const config = computed(() => {
  const val = props.value.toLowerCase();

  if (props.type === "priority") {
    if (
      val === "high" ||
      val === "alta" ||
      val === "urgent" ||
      val === "urgente"
    )
      return "bg-red-500/20 text-red-300 border-red-500/30";
    if (val === "medium" || val === "media")
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    if (val === "low" || val === "baja")
      return "bg-green-500/20 text-green-300 border-green-500/30";
  }

  if (props.type === "status") {
    // Completed states
    if (
      val.includes("done") ||
      val.includes("complet") ||
      val.includes("finish") ||
      val.includes("terminad")
    )
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

    // In progress states
    if (
      val.includes("progress") ||
      val.includes("progreso") ||
      val.includes("doing") ||
      val.includes("haciendo")
    )
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";

    // To do / Pending states
    if (
      val.includes("to do") ||
      val.includes("todo") ||
      val.includes("pendiente") ||
      val.includes("pending")
    )
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";

    // Blocked / On hold states
    if (
      val.includes("block") ||
      val.includes("bloq") ||
      val.includes("hold") ||
      val.includes("espera")
    )
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";

    // Review / Testing states
    if (
      val.includes("review") ||
      val.includes("revision") ||
      val.includes("test") ||
      val.includes("prueba")
    )
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  }

  if (props.type === "role") {
    if (val === "admin")
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    if (val === "manager")
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }

  return "bg-white/10 text-white border-white/20";
});
</script>

<template>
  <span
    :class="`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${config}`">
    <slot>{{ value }}</slot>
  </span>
</template>
