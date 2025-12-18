<script setup lang="ts">
import CountUp from "../components/CountUp.vue";
import { ref, onMounted } from "vue";
import { useProjectState } from "../composables/useProjectState";
import SkeletonLoader from "../components/SkeletonLoader.vue";
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
import ProjectModal from "../components/ProjectModal.vue";
import ConfirmationModal from "../components/ConfirmationModal.vue";
import type { Project } from "../types/global";

const { t } = useI18n();
const {
  projects,
  addProject,
  updateProject,
  deleteProject,
  getProjectProgress,
  getTasksByProject,
  loadProjects,
} = useProjectState();
const isModalOpen = ref(false);
const projectToDelete = ref<string | null>(null);
const projectToEdit = ref<Project | null>(null);
const isMounted = ref(false);
const isLoading = ref(true);

onMounted(() => {
  loadProjects();
  setTimeout(() => {
    isMounted.value = true;
    isLoading.value = false;
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

const handleDeleteProject = (id: string) => {
  projectToDelete.value = id;
};

const confirmDeleteProject = () => {
  if (projectToDelete.value) {
    deleteProject(projectToDelete.value);
    projectToDelete.value = null;
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
  };
  return colors[color] || "bg-indigo-500";
};
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-0 animate-fade-in">
    <!-- Actions Bar (Replaces redundant title) -->
    <div class="flex justify-end mb-6">
      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 cursor-pointer">
        <Plus class="w-5 h-5" />
        {{ t("projects.new_project") }}
      </button>
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
              :class="project.color" />
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

                  <!-- Delete Button -->
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

    <!-- Modal -->
    <ProjectModal
      :is-open="isModalOpen"
      :project="projectToEdit"
      @close="isModalOpen = false"
      @create="handleCreateProject"
      @update="handleUpdateProject" />

    <ConfirmationModal
      :is-open="!!projectToDelete"
      :title="t('projects.delete_confirm_title')"
      :message="t('projects.delete_confirm_msg')"
      :confirm-text="t('common.yes_delete')"
      :cancel-text="t('common.cancel')"
      @close="projectToDelete = null"
      @confirm="confirmDeleteProject" />
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
