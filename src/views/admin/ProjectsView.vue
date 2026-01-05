```
<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import type { Project } from "@/types";
import BaseModal from "@/components/common/BaseModal.vue";
import UserAvatar from "@/components/common/UserAvatar.vue";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";

import { useI18n } from "vue-i18n";

const toast = useToast();
const { confirm } = useConfirm();
const { t, locale } = useI18n();

const projects = ref<Project[]>([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);

const form = ref({
  id: null as number | null,
  name: "",
  description: "",
});

const fetchProjects = async () => {
  loading.value = true;
  try {
    const res = await api.get("/projects");
    projects.value = res.data.data;
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
};

const openModal = (project?: Project) => {
  if (project) {
    form.value = {
      id: project.id,
      name: project.name,
      description: project.description || "",
    };
  } else {
    form.value = { id: null, name: "", description: "" };
  }
  showModal.value = true;
};

const closeModal = async (force: boolean = false) => {
  if (!force && (form.value.name || form.value.description)) {
    const confirmed = await confirm({
      title: t("admin_tasks.close_confirm"),
      message: t("admin_tasks.close_msg"),
      confirmText: t("common.close"),
      cancelText: t("admin_tasks.continue_editing"),
      type: "warning",
    });

    if (!confirmed) return;
  }

  showModal.value = false;
  form.value = { id: null, name: "", description: "" };
};

const handleSubmit = async () => {
  if (!form.value.name) return;
  submitting.value = true;
  try {
    if (form.value.id) {
      await api.put(`/projects/${form.value.id}`, form.value);
      toast.success(
        t("admin_projects.update_success"),
        t("admin_projects.update_msg")
      );
    } else {
      await api.post("/projects", form.value);
      toast.success(
        t("admin_projects.create_success"),
        t("admin_projects.create_msg")
      );
    }
    await fetchProjects();
    closeModal(true);
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || t("common.save_error");
    toast.error(t("common.error_title"), errorMsg);
  } finally {
    submitting.value = false;
  }
};

const deleteProject = async (id: number) => {
  const confirmed = await confirm({
    title: t("admin_projects.delete_confirm"),
    message: t("admin_projects.delete_msg"),
    confirmText: t("common.delete"),
    cancelText: t("common.cancel"),
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete(`/projects/${id}`);
    projects.value = projects.value.filter((p) => p.id !== id);
    toast.success(
      t("admin_projects.delete_success"),
      t("admin_projects.delete_success_msg")
    );
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || t("common.delete_error");
    toast.error(t("common.error_title"), errorMsg);
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return t("date.no_date");
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t("date.today");
  if (diffDays === 1) return t("date.yesterday");
  if (diffDays < 7) return t("date.days_ago", { n: diffDays });
  if (diffDays < 30)
    return t("date.weeks_ago", { n: Math.floor(diffDays / 7) });
  if (diffDays < 365)
    return t("date.months_ago", { n: Math.floor(diffDays / 30) });

  return date.toLocaleDateString(locale.value === "es" ? "es-ES" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(fetchProjects);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">
          {{ $t("admin_projects.title") }}
        </h2>
        <p class="text-text-muted">
          {{ $t("admin_projects.subtitle") }}
        </p>
      </div>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>{{ $t("admin_projects.new_project") }}</span>
      </button>
    </div>

    <!-- Modern Skeleton Loader -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-pulse">
        <div class="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div class="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
        <div class="flex gap-4 mt-6">
          <div class="h-10 bg-slate-700 rounded flex-1"></div>
          <div class="h-10 bg-slate-700 rounded w-10"></div>
        </div>
      </div>
    </div>

    <!-- Project Cards Grid -->
    <div
      v-else-if="projects.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
        <!-- Header with Avatar -->
        <div class="flex items-center gap-4 mb-4">
          <div
            class="w-14 h-14 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-600 group-hover:border-indigo-500 transition-colors shadow-lg">
            {{ project.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
              {{ project.name }}
            </h3>
            <p class="text-xs text-text-muted truncate">
              ID: #{{ project.id }}
            </p>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-3 mb-6">
          <div class="flex items-start gap-2 text-sm text-gray-300">
            <i
              class="fa-solid fa-align-left text-indigo-400 w-5 text-center mt-0.5"></i>
            <span class="line-clamp-2 text-xs leading-relaxed">{{
              project.description || $t("admin_projects.details.no_desc")
            }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-user text-indigo-400 w-5 text-center"></i>
            <span class="truncate">{{
              project.creator_username ||
              $t("admin_projects.details.unassigned")
            }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-calendar text-indigo-400 w-5 text-center"></i>
            <span>{{ formatDate(project.created_at) }}</span>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <div
              class="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <div class="text-xs text-text-muted mb-1">
                {{ $t("admin_projects.details.tasks") }}
              </div>
              <div class="text-lg font-bold text-white">
                {{ project.task_count || 0 }}
              </div>
            </div>
            <div
              class="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <div class="text-xs text-text-muted mb-1">
                {{ $t("admin_projects.details.team") }}
              </div>
              <div class="text-lg font-bold text-white">
                {{ project.member_count || 0 }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <!-- Members Stack -->
          <div class="flex -space-x-2">
            <template v-if="project.users && project.users.length > 0">
              <UserAvatar
                v-for="user in project.users.slice(0, 3)"
                :key="user.id"
                :user="user"
                size="w-8 h-8" />
              <div
                v-if="project.users.length > 3"
                class="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-600 flex items-center justify-center text-[10px] text-white font-bold relative z-0"
                :title="`+${project.users.length - 3} miembros más`">
                +{{ project.users.length - 3 }}
              </div>
            </template>
            <span v-else class="text-xs text-text-muted italic px-2 py-1">{{
              t("admin_projects.no_members")
            }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="openModal(project)"
              class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="$t('common.edit')">
              <i class="fa-solid fa-pen text-sm"></i>
            </button>
            <button
              @click="deleteProject(project.id)"
              class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="$t('common.delete')">
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-12 text-center">
      <div class="inline-flex p-4 rounded-full bg-white/5 mb-4">
        <i class="fa-solid fa-briefcase text-4xl text-text-muted"></i>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">
        {{ $t("admin_projects.empty_title") }}
      </h3>
      <p class="text-text-muted mb-6">
        {{ $t("admin_projects.empty_msg") }}
      </p>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
        <i class="fa-solid fa-plus mr-2"></i>
        {{ $t("admin_projects.create_first") }}
      </button>
    </div>
    <!-- Modal Form -->
    <BaseModal
      :show="showModal"
      :title="
        form.id
          ? $t('admin_projects.edit_project')
          : $t('admin_projects.new_project')
      "
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Project Name -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            {{ $t("admin_projects.form.name") }}
            <span class="text-red-400 ml-1">*</span>
          </label>
          <div class="relative group">
            <div
              class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <i
                class="fa-solid fa-folder text-gray-400 transition-colors group-focus-within:text-primary"></i>
            </div>
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              required
              :placeholder="$t('admin_projects.form.name_placeholder')" />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            {{ $t("admin_projects.form.description") }}
          </label>
          <div class="relative group">
            <div class="absolute left-4 top-4 pointer-events-none">
              <i
                class="fa-solid fa-align-left text-gray-400 transition-colors group-focus-within:text-primary"></i>
            </div>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none hover:border-slate-600"
              :placeholder="
                $t('admin_projects.form.description_placeholder')
              "></textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-6 border-t border-slate-700/50">
          <button
            type="button"
            @click="() => closeModal(false)"
            class="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-white hover:bg-slate-700/50 transition-all duration-200 font-medium flex items-center justify-center gap-2 group">
            <i
              class="fa-solid fa-xmark group-hover:rotate-90 transition-transform duration-200"></i>
            {{ $t("common.cancel") }}
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2">
            <i
              v-if="!submitting"
              :class="['fa-solid', form.id ? 'fa-save' : 'fa-plus']"></i>
            <i v-else class="fa-solid fa-spinner fa-spin"></i>
            {{
              submitting
                ? $t("common.loading")
                : form.id
                ? $t("common.save")
                : $t("common.create")
            }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
