// src/composables/useTaskState.ts
import { ref, computed } from "vue";
import type { Task } from "../types/global";
import api from "../services/api";

const tasks = ref<Task[]>([]);
const isLoading = ref(false);

const mapTask = (t: any): Task => ({
  id: t.id,
  title: t.description || "Sin título",
  completed: t.completed,
  createdAt: new Date(t.created_at),
  projectId: t.project_id ? String(t.project_id) : undefined,
  tags: t.tags ? t.tags.map((tag: any) => String(tag.id)) : [],
  priority: t.priority,
  dueDate: t.due_date ? new Date(t.due_date) : undefined,
});

const loadData = async () => {
  if (!localStorage.getItem("token")) return;
  isLoading.value = true;
  try {
    const resTasks = await api.get("/tasks?limit=1000");

    // Support unwrapped or wrapped responses
    const tasksRaw =
      resTasks.data.data?.tasks ||
      resTasks.data.tasks ||
      resTasks.data.data ||
      resTasks.data ||
      [];

    tasks.value = Array.isArray(tasksRaw) ? tasksRaw.map(mapTask) : [];
  } catch {
    // Silent fail
  } finally {
    isLoading.value = false;
  }
};

const sortedTasks = computed(() =>
  [...tasks.value].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
);

const pendingTasks = computed(() =>
  sortedTasks.value.filter((t) => !t.completed)
);

const completedTasks = computed(() =>
  sortedTasks.value.filter((t) => t.completed)
);

export function useTaskState() {
  function resetState() {
    tasks.value = [];
  }

  return {
    tasks,
    sortedTasks,
    pendingTasks,
    completedTasks,
    isLoading,
    loadData,
    resetState,
  };
}
