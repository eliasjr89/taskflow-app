<script setup lang="ts">
import CountUp from "@/components/common/CountUp.vue";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useProjectStore } from "../stores/projects";
import { useTaskStore } from "../stores/tasks";
import SkeletonLoader from "@/components/common/SkeletonLoader.vue";
import {
  Plus,
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Book,
  Camera,
  Bell,
  Gift,
  Globe,
  Home,
  Music,
  Trash2,
  Pencil,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import ProjectModal from "@/components/projects/ProjectModal.vue";
import { useConfirm } from "../composables/useConfirm";
import type { Project } from "../types/global";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const { confirm } = useConfirm();
const toast = useToast();

const projectStore = useProjectStore();
const taskStore = useTaskStore();
const { projects, isLoading } = storeToRefs(projectStore);
const { tasks } = storeToRefs(taskStore);

const getTasksByProject = (projectId: string) => {
  return tasks.value.filter((t) => t.projectId === projectId);
};

const getProjectProgress = (projectId: string) => {
  const projectTasks = getTasksByProject(projectId);
  if (projectTasks.length === 0) return 0;
  const completed = projectTasks.filter((t) => t.completed).length;
  return Math.round((completed / projectTasks.length) * 100);
};

// Aliases for template compatibility
// const loadProjects = projectStore.fetchProjects; // Not used

const addProject = async (project: Project) => {
  try {
    await projectStore.addProject(project);
    toast.success(t("projects.create_success") || "Project created");
  } catch {
    toast.error(t("projects.create_error") || "Failed to create project");
  }
};
const updateProject = async (project: Project) => {
  try {
    await projectStore.updateProject(project);
    toast.success(t("projects.update_success") || "Project updated");
  } catch {
    toast.error(t("projects.update_error") || "Failed to update project");
  }
};

const deleteProject = async (id: string) => {
  try {
    await projectStore.deleteProject(id);
    toast.success(t("projects.delete_success") || "Project deleted");
  } catch {
    toast.error(t("projects.delete_error") || "Failed to delete project");
  }
};

const isModalOpen = ref(false);
const projectToEdit = ref<Project | null>(null);
const isMounted = ref(false);
// isLoading ref is now coming from store, handled by storeToRefs destructure
// But wait, the component had its own isLoading logic with timeout?
// "setTimeout... isMounted.value = true; isLoading.value = false"
// I should rely on store's isLoading, but the animation timeout is purely visual.
// I'll keep the local `isLoading` if it's for initial transition, but store has `isLoading` too.
// The template uses `isLoading`.
// I'll rename local one to `isInitialLoading` or just override if store is done.

// Let's rely on store for data loading, and `isMounted` for animations.
// If I use `isLoading` from store, it might be true/false.
// The original code: onMounted calls loadProjects() then sets isLoading=false after 600ms.
// I can keep that logic for smooth UX.
const isInitialLoading = ref(true);

onMounted(async () => {
  await Promise.all([projectStore.fetchProjects(), taskStore.fetchTasks()]);
  setTimeout(() => {
    isMounted.value = true;
    isInitialLoading.value = false;
  }, 600);
});

import type { Component } from "vue";

const iconMap: Record<string, Component> = {
  Folder,
  Briefcase,
  Star,
  Heart,
  Zap,
  Coffee,
  Music,
  Book,
  Camera,
  Bell,
  Gift,
  Globe,
  Home,
};

const handleCreateProject = (project: Project) => {
  addProject(project);
  isModalOpen.value = false;
};

const handleUpdateProject = (project: Project) => {
  updateProject(project);
  isModalOpen.value = false;
  projectToEdit.value = null;
};

const openEditModal = (project: Project) => {
  projectToEdit.value = project;
  isModalOpen.value = true;
};

const openCreateModal = () => {
  projectToEdit.value = null;
  isModalOpen.value = true;
};

const handleDeleteProject = async (id: string) => {
  const confirmed = await confirm({
    title: t("projects.delete_confirm_title"),
    message: t("projects.delete_confirm_msg"),
    confirmText: t("common.yes_delete"),
    cancelText: t("common.cancel"),
    type: "danger",
  });

  if (confirmed) {
    deleteProject(id);
  }
};

const getColorClass = (color: string) => {
  const colors: Record<string, string> = {
    indigo:
      "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
    purple:
      "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    pink: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400",
    rose: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
    orange:
      "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    amber:
      "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    green:
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    teal: "text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400",
    cyan: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400",
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    lime: "text-lime-600 bg-lime-100 dark:bg-lime-900/30 dark:text-lime-400",
    emerald:
      "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    fuchsia:
      "text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
    sky: "text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400",
    violet:
      "text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400",
  };
  return colors[color] || colors.indigo;
};

const getProgressColor = (color: string) => {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    green: "bg-green-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    blue: "bg-blue-500",
    lime: "bg-lime-500",
    emerald: "bg-emerald-500",
    fuchsia: "bg-fuchsia-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
  };
  return colors[color] || "bg-indigo-500";
};
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-0 animate-fade-in">
    <!-- Header with Actions -->
    <div class="flex items-center justify-between mb-6">
      <!-- Left: Title -->
      <div class="flex items-center gap-2">
        <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Folder class="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {{ t("nav.projects") }}
        </h1>
      </div>

      <!-- Center/Right: Action Button -->
      <div class="flex-1 flex justify-end md:justify-end">
        <button
          @click="openCreateModal"
          class="w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full md:rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          :title="t('projects.new_project')">
          <Plus class="w-6 h-6" />
          <span class="hidden md:inline">{{ t("projects.new_project") }}</span>
        </button>
      </div>
    </div>

    <!-- SKELETON LOADING -->
    <div v-if="isLoading">
      <SkeletonLoader type="card" :count="6" />
    </div>

    <!-- MAIN CONTENT -->
    <div v-else>
      <div
        v-if="projects.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          class="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
          <div
            class="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
            <component
              :is="iconMap[project.icon] || Folder"
              class="w-24 h-24"
              :class="`text-${project.color}-500`" />
          </div>

          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4 relative z-10">
              <div class="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 w-fit">
                <component
                  :is="iconMap[project.icon] || Folder"
                  class="w-8 h-8"
                  :class="getColorClass(project.color)" />
              </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {{ project.title }}
            </h3>
            <p
              class="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 h-10">
              {{ project.description }}
            </p>

            <div class="space-y-3">
              <div class="flex justify-between text-sm font-medium">
                <span class="text-gray-600 dark:text-gray-300">{{
                  t("projects.progress")
                }}</span>
                <span class="text-indigo-600 dark:text-indigo-400">
                  <CountUp :to="getProjectProgress(project.id)" />%
                </span>
              </div>
              <div
                class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  class="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                  :class="getProgressColor(project.color)"
                  :style="{
                    width: isMounted
                      ? `${getProjectProgress(project.id)}%`
                      : '0%',
                  }"></div>
              </div>
              <div class="flex justify-between items-center pt-2">
                <span
                  class="text-xs text-gray-500 dark:text-gray-400 font-medium px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50">
                  {{
                    t("projects.tasks_count", {
                      count: getTasksByProject(project.id).length,
                    })
                  }}
                </span>

                <!-- Edit & Delete Buttons Container -->
                <div class="flex items-center gap-1">
                  <!-- Edit Button -->
                  <button
                    @click.stop="openEditModal(project)"
                    class="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 relative z-20 cursor-pointer"
                    :title="t('common.edit')">
                    <Pencil class="w-5 h-5" />
                  </button>

                  <button
                    @click.stop="handleDeleteProject(project.id)"
                    class="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 relative z-20 cursor-pointer"
                    :title="t('projects.delete_project')">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-20 glass-panel rounded-3xl border-dashed border-2 border-gray-200 dark:border-gray-700">
        <div
          class="mb-6 bg-indigo-50 dark:bg-indigo-900/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-bounce-slow">
          <Folder class="w-10 h-10 text-indigo-500" />
        </div>
        <h3
          class="text-xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
          {{ t("projects.empty_state_title") }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {{ t("projects.empty_state_msg") }}
        </p>
        <button
          @click="openCreateModal"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5">
          {{ t("projects.new_project") }}
        </button>
      </div>
    </div>

    <ProjectModal
      :is-open="isModalOpen"
      :project="projectToEdit"
      @close="isModalOpen = false"
      @create="handleCreateProject"
      @update="handleUpdateProject" />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-5%);
  }
  50% {
    transform: translateY(5%);
  }
}
</style>
