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
    title: t.description || t.title || "Sin título",
    completed: t.completed || false,
    createdAt: t.created_at ? new Date(t.created_at) : new Date(),
    projectId: t.project_id ? String(t.project_id) : undefined,
    tags: t.tags ? t.tags.map((tag: any) => String(tag.id)) : [],
    priority: t.priority || "medium",
    dueDate: t.due_date ? new Date(t.due_date) : undefined,
    projectName: t.project_name || undefined,
    projectColor: t.project_color || undefined,
    projectIcon: t.project_icon || undefined,
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

      // Validate with Zod - Safe Parse to debug issues
      const result = z.array(TaskSchema).safeParse(tasksRaw);

      if (!result.success) {
        // Attempt to use raw tasks if validation specific items failed, strictly for debugging/fallback
        // Ideally we filter out bad ones, but let's try to map what we can
        // We will map tasksRaw directly if parse fails to ensure data shows up
        tasks.value = tasksRaw.map(mapTask);
      } else {
        tasks.value = result.data.map(mapTask);
      }
      // ignore error
    } finally {
      isLoading.value = false;
    }
  };

  const createTask = async (taskData: {
    description: string;
    project_id: number;
    status_id?: number;
    priority?: "low" | "medium" | "high";
    due_date?: Date;
    tag_ids?: number[];
  }) => {
    try {
      // payload logged previously
      await api.post("/tasks", taskData);
      await fetchTasks(); // Refresh to get new task with ID
      return true;
    } catch {
      return false;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks();
      return true;
    } catch {
      return false;
    }
  };

  const toggleCompletion = async (id: number) => {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return false;

    const originalState = task.completed;
    task.completed = !task.completed; // Optimistic update

    try {
      await api.put(`/tasks/${id}`, { completed: task.completed });
      return true;
    } catch {
      task.completed = originalState; // Revert on error
      return false;
    }
  };

  const updateTaskData = async (id: number, updates: Partial<Task>) => {
    try {
      const payload: any = {};
      if (updates.title) payload.description = updates.title;
      if (updates.priority) payload.priority = updates.priority;
      if (updates.projectId) payload.project_id = Number(updates.projectId);
      if (updates.dueDate) payload.due_date = updates.dueDate;
      if (updates.completed !== undefined)
        payload.completed = updates.completed;

      await api.put(`/tasks/${id}`, payload);
      await fetchTasks();
      return true;
    } catch {
      return false;
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
    } catch {
      // error logged previously
    }
  };

  const handleSocketTaskUpdate = (rawTask: any) => {
    try {
      const mapped = mapTask(rawTask);
      updateTask(mapped);
    } catch {
      // error logged previously
    }
  };

  return {
    tasks,
    isLoading,
    sortedTasks,
    pendingTasks,
    completedTasks,
    fetchTasks,
    createTask,
    deleteTask,
    toggleCompletion,
    updateTaskData,
    reset,
    addTask,
    updateTask,
    removeTask,
    handleSocketTaskCreate,
    handleSocketTaskUpdate,
  };
});
