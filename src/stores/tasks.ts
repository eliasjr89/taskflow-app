// src/stores/tasks.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import type { Task } from "../types/global";
import { TaskSchema, type APITask } from "../schemas/task";
import { z } from "zod";

export const useTaskStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const isLoading = ref(false);

  // Getters
  const sortedTasks = computed(() =>
    [...tasks.value].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  );

  const pendingTasks = computed(() =>
    sortedTasks.value.filter((t) => !t.completed)
  );

  const completedTasks = computed(() =>
    sortedTasks.value.filter((t) => t.completed)
  );

  // Actions
  const mapTask = (t: APITask): Task => ({
    id: t.id,
    title: t.description || "Sin título",
    completed: t.completed,
    createdAt: new Date(t.created_at),
    projectId: t.project_id ? String(t.project_id) : undefined,
    tags: t.tags ? t.tags.map((tag: any) => String(tag.id)) : [],
    priority: t.priority || "medium",
    dueDate: t.due_date ? new Date(t.due_date) : undefined,
    projectName: t.project_name || undefined,
  });

  const fetchTasks = async () => {
    // Basic check if token exists, though AuthStore handles protection usually
    if (!localStorage.getItem("token")) return;

    isLoading.value = true;
    try {
      const resTasks = await api.get("/tasks?limit=1000");

      const tasksRaw =
        resTasks.data.data?.tasks ||
        resTasks.data.tasks ||
        resTasks.data.data ||
        resTasks.data ||
        [];

      // Validate with Zod
      const validatedTasks = z.array(TaskSchema).parse(tasksRaw);

      tasks.value = validatedTasks.map(mapTask);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    tasks.value = [];
    isLoading.value = false;
  };

  const addTask = (task: Task) => {
    tasks.value.push(task);
  };

  const updateTask = (updatedTask: Task) => {
    const index = tasks.value.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
      tasks.value[index] = updatedTask;
    }
  };

  const removeTask = (taskId: string | number) => {
    tasks.value = tasks.value.filter((t) => t.id !== taskId);
  };

  const handleSocketTaskCreate = (rawTask: any) => {
    // Avoid duplicates if we already have it (e.g. from optimistic update or fetch)
    if (tasks.value.find((t) => t.id === rawTask.id)) return;
    try {
      // Validate or just map depending on trust level. Mapping is safer.
      const mapped = mapTask(rawTask);
      addTask(mapped);
    } catch (e) {
      console.error("Socket task create error", e);
    }
  };

  const handleSocketTaskUpdate = (rawTask: any) => {
    try {
      const mapped = mapTask(rawTask);
      updateTask(mapped);
    } catch (e) {
      console.error("Socket task update error", e);
    }
  };

  return {
    tasks,
    isLoading,
    sortedTasks,
    pendingTasks,
    completedTasks,
    fetchTasks,
    reset,
    addTask,
    updateTask,
    removeTask,
    handleSocketTaskCreate,
    handleSocketTaskUpdate,
  };
});
