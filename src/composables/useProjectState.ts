import { ref } from "vue";
import type { Project, Task } from "../types/global";
import api from "../services/api";
import { useTaskState } from "./useTaskState";

const projects = ref<Project[]>([]);
const isLoading = ref(false);

const mapProject = (p: any): Project => ({
  id: String(p.id),
  title: p.name,
  description: p.description,
  createdAt: new Date(p.created_at),
  color: p.color || "indigo",
  icon: p.icon || "Folder",
});

const loadProjects = async () => {
  if (!localStorage.getItem("token")) return;
  isLoading.value = true;
  try {
    const resProjects = await api.get("/projects");
    const projectsRaw = resProjects.data.data || resProjects.data || [];
    projects.value = Array.isArray(projectsRaw)
      ? projectsRaw.map(mapProject)
      : [];
  } catch {
    // Silent fail
  } finally {
    isLoading.value = false;
  }
};

import { useToast } from "./useToast";

// ... existing code ...

const addProject = async (project: Project) => {
  const toast = useToast();
  try {
    await api.post("/projects", {
      name: project.title,
      description: project.description,
      color: project.color,
      icon: project.icon,
    });
    await loadProjects();
    toast.success("Project created successfully");
  } catch {
    toast.error("Failed to create project");
  }
};

const updateProject = async (updatedProject: Project) => {
  const toast = useToast();
  try {
    await api.put(`/projects/${updatedProject.id}`, {
      name: updatedProject.title,
      description: updatedProject.description,
      color: updatedProject.color,
      icon: updatedProject.icon,
    });
    await loadProjects();
    toast.success("Project updated successfully");
  } catch {
    toast.error("Failed to update project");
  }
};

const deleteProject = async (projectId: string) => {
  const toast = useToast();
  try {
    await api.delete(`/projects/${projectId}`);
    await loadProjects();
    toast.success("Project deleted successfully");
  } catch {
    toast.error("Failed to delete project");
  }
};

export function useProjectState() {
  const { tasks } = useTaskState();

  const getTasksByProject = (projectId: string) =>
    tasks.value.filter((t: Task) => t.projectId === projectId);

  const getProjectProgress = (projectId: string) => {
    const projectTasks = getTasksByProject(projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t: Task) => t.completed).length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  function resetProjectState() {
    projects.value = [];
  }

  return {
    projects,
    isLoading,
    loadProjects,
    addProject,
    updateProject,
    deleteProject,
    getTasksByProject,
    getProjectProgress,
    resetProjectState,
  };
}
