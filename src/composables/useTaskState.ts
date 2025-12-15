// src/composables/useTaskState.ts
import { ref, computed } from "vue";
import type { Task, Project } from "../types/global";
import api from "../services/api";

const tasks = ref<Task[]>([]);
const projects = ref<Project[]>([]);
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

const mapProject = (p: any): Project => ({
  id: String(p.id),
  title: p.name,
  description: p.description,
  createdAt: new Date(p.created_at),
  color: "indigo", // Default until backend supports it
  icon: "Folder",
});

const loadData = async () => {
  if (!localStorage.getItem("token")) return;
  isLoading.value = true;
  try {
    const [resTasks, resProjects] = await Promise.all([
      api.get("/tasks"),
      api.get("/projects"),
    ]);

    // Support unwrapped or wrapped responses
    const tasksRaw =
      resTasks.data.data?.tasks ||
      resTasks.data.tasks ||
      resTasks.data.data ||
      resTasks.data ||
      [];
    const projectsRaw = resProjects.data.data || resProjects.data || [];

    tasks.value = Array.isArray(tasksRaw) ? tasksRaw.map(mapTask) : [];
    projects.value = Array.isArray(projectsRaw)
      ? projectsRaw.map(mapProject)
      : [];
  } catch {
    // Silent fail
  } finally {
    isLoading.value = false;
  }
};

// Initial Load removed to prevent infinite loops on login
// loadData();

const sortedTasks = computed(() =>
  [...tasks.value].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
);

const pendingTasks = computed(() =>
  sortedTasks.value.filter((t) => !t.completed)
);

const completedTasks = computed(() =>
  sortedTasks.value.filter((t) => t.completed)
);

// Project Methods
const addProject = async (project: Project) => {
  try {
    await api.post("/projects", {
      name: project.title,
      description: project.description,
    });
    await loadData(); // Refresh to get ID
  } catch {
    // Silent fail
  }
};

const deleteProject = async (projectId: string) => {
  try {
    await api.delete(`/projects/${projectId}`);
    await loadData();
  } catch {
    // Silent fail
  }
};

const getTasksByProject = (projectId: string) =>
  tasks.value.filter((t) => t.projectId === projectId);

const getProjectProgress = (projectId: string) => {
  const projectTasks = tasks.value.filter((t) => t.projectId === projectId);
  if (projectTasks.length === 0) return 0;
  const completed = projectTasks.filter((t) => t.completed).length;
  return Math.round((completed / projectTasks.length) * 100);
};

export function useTaskState() {
  async function updateProject(updatedProject: Project) {
    try {
      await api.put(`/projects/${updatedProject.id}`, {
        name: updatedProject.title,
        description: updatedProject.description,
      });
      await loadData();
    } catch {
      // console.error("Failed to update project", e);
    }
  }

  function resetState() {
    tasks.value = [];
    projects.value = [];
  }

  return {
    tasks,
    projects,
    sortedTasks,
    pendingTasks,
    completedTasks,
    isLoading,
    loadData,
    addProject,
    updateProject,
    deleteProject,
    getProjectProgress,
    getTasksByProject,
    resetState,
  };
}
