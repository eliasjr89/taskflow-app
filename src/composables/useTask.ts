// src/composables/useTasks.ts
import { useTaskState } from "./useTaskState";
import type { Task } from "../types/global";

export function useTasks() {
  const { tasks } = useTaskState();

  function loadTask() {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      const parsed: Task[] = JSON.parse(saved);
      tasks.value = parsed.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
      }));
    }
  }

  function addTask(title: string, projectId?: string) {
    const task: Task = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date(),
      projectId,
    };

    tasks.value.push(task);
  }

  function removeTask(id: number) {
    tasks.value = tasks.value.filter((t) => t.id !== id);
  }

  function toggleTaskCompletion(id: number) {
    const t = tasks.value.find((t) => t.id === id);
    if (t) t.completed = !t.completed;
  }

  function updateTask(id: number, updates: Partial<Task>) {
    const t = tasks.value.find((task) => task.id === id);
    if (t) Object.assign(t, updates);
  }

  return {
    loadTask,
    addTask,
    removeTask,
    toggleTaskCompletion,
    updateTask,
  };
}
