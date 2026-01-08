import { storeToRefs } from "pinia";
import { useTaskStore } from "../stores/tasks";
import { useProjectStore } from "../stores/projects";
import { useFeedback } from "./useFeedback";
import { useI18n } from "vue-i18n";

/**
 * Composable for task operations
 * This is now a thin wrapper around the task store for convenience
 */
export function useTasks() {
  const taskStore = useTaskStore();
  const projectStore = useProjectStore();
  const { tasks } = storeToRefs(taskStore);
  const { projects } = storeToRefs(projectStore);
  const { showFeedback } = useFeedback();
  const { t } = useI18n();

  const loadTask = taskStore.fetchTasks;

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

      // console.log("Adding task:", title, "Project:", finalProjectId);
      const success = await taskStore.createTask({
        description: title,
        project_id: finalProjectId,
        status_id: 1,
        priority: priority || "medium",
        due_date: dueDate,
        tag_ids: _tags ? _tags.map(Number) : undefined,
      });
      // console.log("Task creation result:", success);

      if (success) {
        showFeedback(
          t("tasks.task_created"),
          t("tasks.task_created_msg"),
          "success"
        );
      } else {
        showFeedback(
          t("tasks.create_error"),
          t("common.error_occurred"),
          "error"
        );
      }

      return success;
    } catch {
      showFeedback(
        t("tasks.create_error"),
        t("common.error_occurred"),
        "error"
      );
      return false;
    }
  }

  async function removeTask(id: number) {
    return await taskStore.deleteTask(id);
  }

  async function toggleTaskCompletion(id: number) {
    return await taskStore.toggleCompletion(id);
  }

  async function updateTask(id: number, updates: any) {
    return await taskStore.updateTaskData(id, updates);
  }

  return {
    tasks,
    loadTask,
    addTask,
    removeTask,
    toggleTaskCompletion,
    updateTask,
  };
}
