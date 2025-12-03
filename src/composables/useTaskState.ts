// src/composables/useTaskState.ts
import { ref, computed, watch } from "vue";
import type { Task, Project } from "../types/global";

const tasks = ref<Task[]>([]);
const projects = ref<Project[]>([]);

// Load from localStorage
const loadState = () => {
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) {
    tasks.value = JSON.parse(storedTasks, (key, value) => {
      if (key === "createdAt") return new Date(value);
      return value;
    });
  }

  const storedProjects = localStorage.getItem("projects");
  if (storedProjects) {
    projects.value = JSON.parse(storedProjects, (key, value) => {
      if (key === "createdAt") return new Date(value);
      return value;
    });
  }
};

loadState();

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
const addProject = (project: Project) => {
  projects.value.push(project);
};

const deleteProject = (projectId: string) => {
  projects.value = projects.value.filter((p) => p.id !== projectId);
  // Optional: Remove tasks associated with the project or keep them?
  // For now, let's keep them but remove the projectId reference
  tasks.value = tasks.value.map(t => 
    t.projectId === projectId ? { ...t, projectId: undefined } : t
  );
};

const getTasksByProject = (projectId: string) =>
  tasks.value.filter(t => t.projectId === projectId);

const getProjectProgress = (projectId: string) => {
  const projectTasks = tasks.value.filter(t => t.projectId === projectId);
  if (projectTasks.length === 0) return 0;
  const completed = projectTasks.filter(t => t.completed).length;
  return Math.round((completed / projectTasks.length) * 100);
};

watch(
  tasks,
  () => {
    localStorage.setItem("tasks", JSON.stringify(tasks.value));
  },
  { deep: true }
);

watch(
  projects,
  () => {
    localStorage.setItem("projects", JSON.stringify(projects.value));
  },
  { deep: true }
);

export function useTaskState() {
  function updateProject(updatedProject: Project) {
    const index = projects.value.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      projects.value[index] = updatedProject;
    }
  }

  return {
    tasks,
    projects,
    sortedTasks,
    pendingTasks,
    completedTasks,
    addProject,
    updateProject,
    deleteProject,
    getProjectProgress,
    getTasksByProject,
  };
}
