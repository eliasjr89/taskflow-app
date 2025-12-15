// src/composables/useTasks.ts
import { useTaskState } from "./useTaskState";
import api from "../services/api";
import type { Task } from "../types/global";
import { useFeedback } from "./useFeedback";
import { useI18n } from "vue-i18n";

export function useTasks() {
  const { tasks, loadData, projects } = useTaskState();
  const { showFeedback } = useFeedback();
  const { t } = useI18n();

  // Re-export loadTask as loadData alias to maintain compatibility if view calls loadTask
  const loadTask = loadData;

  async function addTask(
    title: string,
    projectId?: string,
    _tags?: string[],
    priority?: "low" | "medium" | "high",
    dueDate?: Date
  ) {
    try {
      let finalProjectId = projectId ? Number(projectId) : undefined;

      // Fallback: If no project selected, use the first available project
      if (!finalProjectId && projects.value.length > 0) {
        const firstProject = projects.value[0];
        if (firstProject) {
          finalProjectId = Number(firstProject.id);
        }
      }

      if (!finalProjectId) {
        showFeedback(
          t("tasks.create_error"),
          t("tasks.create_error_no_project"),
          "error"
        );
        return false;
      }

      const payload = {
        description: title,
        project_id: finalProjectId,
        status_id: 1, // Defaulting to status 1 (Pending)
        priority: priority || "medium",
        due_date: dueDate,
        // tags handling would go here (requires separate endpoints or advanced backend logic)
      };

      await api.post("/tasks", payload);
      await loadData(); // Refresh list to get the new task with ID from DB

      showFeedback(
        t("tasks.task_created"),
        t("tasks.task_created_msg"),
        "success"
      );
      return true;
    } catch {
      showFeedback(
        t("tasks.create_error"),
        t("common.error_occurred"), // Assuming generic error message key
        "error"
      );
      return false;
    }
  }

  async function removeTask(id: number) {
    try {
      // Optimistic upate could be done here
      await api.delete(`/tasks/${id}`);
      await loadData();
    } catch {
      // Handle error
    }
  }

  async function toggleTaskCompletion(id: number) {
    const t = tasks.value.find((t) => t.id === id);
    if (!t) return;

    // Optimistic Update
    const originalState = t.completed;
    t.completed = !t.completed;

    try {
      await api.put(`/tasks/${id}`, { completed: t.completed });
    } catch {
      t.completed = originalState; // Revert
    }
  }

  async function updateTask(id: number, updates: Partial<Task>) {
    try {
      // Convert frontend fields to backend
      const payload: any = {};
      if (updates.title) payload.description = updates.title;
      if (updates.priority) payload.priority = updates.priority;
      if (updates.projectId) payload.project_id = Number(updates.projectId);
      if (updates.dueDate) payload.due_date = updates.dueDate;

      await api.put(`/tasks/${id}`, payload);
      await loadData();
    } catch {
      // Handle error
    }
  }

  return {
    loadTask,
    addTask,
    removeTask,
    toggleTaskCompletion,
    updateTask,
  };
}
