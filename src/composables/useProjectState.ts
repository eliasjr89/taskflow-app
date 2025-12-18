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
  color: "indigo", // Default until backend supports it
  icon: "Folder",
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

const addProject = async (project: Project) => {
  try {
    await api.post("/projects", {
      name: project.title,
      description: project.description,
    });
    await loadProjects();
  } catch {
    // Silent fail
  }
};

const updateProject = async (updatedProject: Project) => {
  try {
    await api.put(`/projects/${updatedProject.id}`, {
      name: updatedProject.title,
      description: updatedProject.description,
    });
    await loadProjects();
  } catch {
    // console.error("Failed to update project", e);
  }
};

const deleteProject = async (projectId: string) => {
  try {
    await api.delete(`/projects/${projectId}`);
    await loadProjects();
  } catch {
    // Silent fail
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
