// src/composables/useTaskState.ts
import { ref, computed, watch } from "vue";
import type { Task } from "../types/global";

const tasks = ref<Task[]>([]);

const sortedTasks = computed(() =>
  [...tasks.value].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
);

const pendingTasks = computed(() =>
  sortedTasks.value.filter((t) => !t.completed)
);

const completedTasks = computed(() =>
  sortedTasks.value.filter((t) => t.completed)
);

watch(
  tasks,
  () => {
    localStorage.setItem("tasks", JSON.stringify(tasks.value));
  },
  { deep: true }
);

export function useTaskState() {
  return {
    tasks,
    sortedTasks,
    pendingTasks,
    completedTasks,
  };
}
