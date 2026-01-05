import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../services/api";
import type { Project } from "../types/global";
import { ProjectSchema, type APIProject } from "../schemas/project";
import { z } from "zod";

export const useProjectStore = defineStore("projects", () => {
  const projects = ref<Project[]>([]);
  const isLoading = ref(false);

  // Mapping function
  const mapProject = (p: APIProject): Project => ({
    id: String(p.id),
    title: p.name,
    description: p.description || "",
    color: p.color || "indigo",
    icon: p.icon || "Folder",
    createdAt: new Date(p.created_at),
  });

  const fetchProjects = async () => {
    if (!localStorage.getItem("token")) return;
    isLoading.value = true;
    try {
      const res = await api.get("/projects");
      const rawData = res.data.data || res.data || [];

      // Validate
      const validatedData = z.array(ProjectSchema).parse(rawData);

      projects.value = validatedData.map(mapProject);
    } catch {
      // ignore
    } finally {
      isLoading.value = false;
    }
  };

  const addProject = async (project: Partial<Project>) => {
    // Let errors bubble up to component
    const payload = {
      name: project.title,
      description: project.description,
      color: project.color,
      icon: project.icon,
    };
    await api.post("/projects", payload);
    await fetchProjects();
    return true;
  };

  const updateProject = async (project: Project) => {
    const payload = {
      name: project.title,
      description: project.description,
      color: project.color,
      icon: project.icon,
    };
    await api.put(`/projects/${project.id}`, payload);
    await fetchProjects();
    return true;
  };

  const deleteProject = async (id: string) => {
    await api.delete(`/projects/${id}`);
    // Optimistic removal
    projects.value = projects.value.filter((p) => p.id !== id);
    // await fetchProjects(); // Verification
    return true;
  };

  return {
    projects,
    isLoading,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };
});
