<script setup lang="ts">
import { computed } from "vue";
import { Flag } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  priority: "low" | "medium" | "high" | "urgent" | undefined | null;
  showIcon?: boolean;
}>();

const { t } = useI18n();

const priorityConfig = computed(() => {
  switch (props.priority) {
    case "low":
      return {
        class:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        label: t("tasks.low"),
      };
    case "medium":
      return {
        class:
          "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
        label: t("tasks.medium"),
      };
    case "high":
      return {
        class:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        label: t("tasks.high"),
      };
    case "urgent":
      return {
        class:
          "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        label: t("tasks.urgent"),
      };
    default:
      return {
        class:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
        label: "Normal",
      };
  }
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
    :class="priorityConfig.class">
    <Flag v-if="showIcon" class="w-3 h-3" />
    {{ priorityConfig.label }}
  </span>
</template>
