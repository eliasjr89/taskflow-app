<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import type { Task, Project } from "@/types";
import BaseModal from "@/components/common/BaseModal.vue";
import UserAvatar from "@/components/common/UserAvatar.vue";
// Badge removed as we use inline styles for consistency with UsersView card design
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useConfetti } from "@/composables/useConfetti";
import EnhancedSelect from "@/components/common/EnhancedSelect.vue";
import MultiSelect from "@/components/common/MultiSelect.vue";
import { useI18n } from "vue-i18n";

const toast = useToast();
const { confirm } = useConfirm();
const { triggerConfetti } = useConfetti();
const { t, locale } = useI18n();

// Types
interface TaskStatus {
  id: number;
  name: string;
}

// State
const tasks = ref<Task[]>([]);
const projects = ref<Project[]>([]);
const statuses = ref<TaskStatus[]>([]);
const users = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);

const form = ref({
  id: null as number | null,
  description: "",
  project_id: null as number | null,
  status_id: null as number | null,
  priority: "low" as "low" | "medium" | "high",
  due_date: null as string | null,
  user_ids: [] as number[],
});

// Fetch Data
const fetchData = async () => {
  loading.value = true;
  try {
    // Parallel fetching for performance
    const [tasksRes, projectsRes, statusesRes] = await Promise.all([
      api.get("/tasks?limit=1000"),
      api.get("/projects"),
      api.get("/task-statuses"),
    ]);

    tasks.value = tasksRes.data.data || tasksRes.data || [];
    projects.value = projectsRes.data.data || projectsRes.data || [];
    statuses.value = statusesRes.data.data || statusesRes.data || [];

    // Fetch users for assignment (silent fail permissible or independent)
    try {
      const usersRes = await api.get("/users");
      users.value = usersRes.data.data || usersRes.data || [];
    } catch (e) {}
  } catch {
    toast.error(t("common.error_title"), t("common.load_error"));
  } finally {
    loading.value = false;
  }
};

const fetchProjects = async () => {
  try {
    const res = await api.get("/projects");
    projects.value = res.data.data || res.data || [];
  } catch {
    // Silent error
  }
};

const fetchStatuses = async () => {
  try {
    const res = await api.get("/task-statuses");
    statuses.value = res.data.data || res.data || [];
  } catch {
    // Silent error
  }
};

// Actions
const openModal = async (task?: Task) => {
  // Ensure we have fresh data for dropdowns
  if (projects.value.length === 0) {
    await fetchProjects();
  }
  if (statuses.value.length === 0) {
    await fetchStatuses();
  }

  if (task) {
    form.value = {
      id: task.id,
      description: task.description,
      project_id: task.project_id,
      status_id: task.status_id,
      priority: task.priority,
      due_date: task.due_date || null,
      user_ids: task.users ? task.users.map((u: any) => u.id) : [],
    };
  } else {
    form.value = {
      id: null,
      description: "",
      project_id: null,
      status_id: statuses.value[0]?.id ?? 1, // Default status
      priority: "low",
      due_date: null,
      user_ids: [],
    };
  }
  showModal.value = true;
};

const closeModal = async (force: boolean = false) => {
  if (!force && (form.value.description || form.value.project_id)) {
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
  form.value = {
    id: null,
    description: "",
    project_id: null,
    status_id: null,
    priority: "low",
    due_date: null,
    user_ids: [],
  };
};

const handleSubmit = async () => {
  if (
    !form.value.description ||
    !form.value.project_id ||
    !form.value.status_id
  )
    return;

  submitting.value = true;
  try {
    const payload: any = {
      description: form.value.description,
      project_id: form.value.project_id,
      status_id: form.value.status_id,
      priority: form.value.priority,
      user_ids: form.value.user_ids,
    };

    // Add due_date if it exists
    if (form.value.due_date) {
      payload.due_date = form.value.due_date;
    }

    if (form.value.id) {
      await api.put(`/tasks/${form.value.id}`, payload);
      toast.success(
        t("admin_tasks.update_success"),
        t("admin_tasks.update_msg")
      );
    } else {
      await api.post("/tasks", payload);
      toast.success(
        t("admin_tasks.create_success"),
        t("admin_tasks.create_msg")
      );
    }
    await fetchData(); // Refresh list
    closeModal(true);
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || t("common.save_error");
    toast.error(t("common.error_title"), errorMsg);
  } finally {
    submitting.value = false;
  }
};

const deleteTask = async (id: number) => {
  const confirmed = await confirm({
    title: t("admin_tasks.delete_confirm"),
    message: t("admin_tasks.delete_msg"),
    confirmText: t("common.delete"),
    cancelText: t("common.cancel"),
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete(`/tasks/${id}`);
    tasks.value = tasks.value.filter((t) => t.id !== id);
    toast.success(
      t("admin_tasks.delete_success"),
      t("admin_tasks.delete_success_msg")
    );
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || t("common.delete_error");
    toast.error(t("common.error_title"), errorMsg);
  }
};

const completeTask = async (task: Task) => {
  const confirmed = await confirm({
    title: t("admin_tasks.complete_confirm"),
    // use simple replace for now or t() interpolation
    message: t("admin_tasks.complete_msg", { task: task.description }),
    confirmText: t("common.confirm"),
    cancelText: t("common.cancel"),
    type: "success",
  });

  if (!confirmed) return;

  try {
    // Find the "Completed" or "Done" status
    const completedStatus = statuses.value.find(
      (s) =>
        s.name.toLowerCase().includes("complet") ||
        s.name.toLowerCase().includes("done")
    );

    if (!completedStatus) {
      toast.error(t("common.error_title"), t("common.error_occurred"));
      return;
    }

    await api.put(`/tasks/${task.id}`, {
      ...task,
      status_id: completedStatus.id,
      completed: true,
    });

    // Update local state
    const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
    const taskToUpdate = tasks.value[taskIndex];
    if (taskToUpdate) {
      taskToUpdate.status_id = completedStatus.id;
      taskToUpdate.status_name = completedStatus.name;
    }

    // Trigger confetti!
    triggerConfetti();

    toast.success(
      t("admin_tasks.marked_completed"),
      t("admin_tasks.marked_completed_msg")
    );
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || t("common.error_occurred");
    toast.error(t("common.error_title"), errorMsg);
  }
};

const uncompleteTask = async (task: Task) => {
  const confirmed = await confirm({
    title: t("admin_tasks.uncomplete_confirm"),
    message: t("admin_tasks.uncomplete_msg", { task: task.description }),
    confirmText: t("common.confirm"),
    cancelText: t("common.cancel"),
    type: "warning",
  });

  if (!confirmed) return;

  try {
    // Find the "To Do" or "Pending" status
    const pendingStatus = statuses.value.find(
      (s) =>
        s.name.toLowerCase().includes("to do") ||
        s.name.toLowerCase().includes("pendiente") ||
        s.name.toLowerCase().includes("pending")
    );

    if (!pendingStatus) {
      toast.error(t("common.error_title"), t("common.error_occurred"));
      return;
    }

    await api.put(`/tasks/${task.id}`, {
      ...task,
      status_id: pendingStatus.id,
      completed: false,
    });

    // Update local state
    const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
    const taskToUpdate = tasks.value[taskIndex];
    if (taskToUpdate) {
      taskToUpdate.status_id = pendingStatus.id;
      taskToUpdate.status_name = pendingStatus.name;
    }

    toast.success(
      t("admin_tasks.marked_pending"),
      t("admin_tasks.marked_pending_msg")
    );
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || t("common.error_occurred");
    toast.error(t("common.error_title"), errorMsg);
  }
};

// Helper function to check if task is completed
const isTaskCompleted = (task: Task): boolean => {
  const statusName = task.status_name?.toLowerCase() || "";
  return statusName.includes("complet") || statusName.includes("done");
};

const formatDate = (dateString?: string | null) => {
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

onMounted(fetchData);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">
          {{ $t("admin_tasks.title") }}
        </h2>
        <p class="text-text-muted">{{ $t("admin_tasks.subtitle") }}</p>
      </div>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>{{ $t("admin_tasks.new_task") }}</span>
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
        <div class="flex justify-between mb-4">
          <div class="h-4 bg-slate-700 rounded w-20"></div>
          <div class="h-4 bg-slate-700 rounded w-4"></div>
        </div>
        <div class="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div class="flex gap-2 mb-4">
          <div class="h-6 bg-slate-700 rounded w-20"></div>
          <div class="h-6 bg-slate-700 rounded w-20"></div>
        </div>
        <div
          class="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
          <div class="h-8 bg-slate-700 rounded w-20"></div>
          <div class="flex gap-2">
            <div class="w-8 h-8 bg-slate-700 rounded"></div>
            <div class="w-8 h-8 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="tasks.length === 0"
      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-12 text-center">
      <div class="inline-flex p-4 rounded-full bg-white/5 mb-4">
        <i class="fa-solid fa-clipboard-check text-4xl text-text-muted"></i>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">
        {{ $t("admin_tasks.empty_title") }}
      </h3>
      <p class="text-text-muted mb-6">
        {{ $t("admin_tasks.empty_msg") }}
      </p>
      <button
        @click="openModal()"
        class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm inline-flex items-center gap-2">
        {{ $t("admin_tasks.create_first") }}
      </button>
    </div>

    <!-- Task Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 relative">
        <!-- Status Stripe -->
        <div
          :class="[
            'absolute top-0 left-0 w-1 h-full transition-colors rounded-l-2xl',
            isTaskCompleted(task) ? 'bg-emerald-500' : 'bg-blue-500',
          ]"></div>
        <!-- Header with Avatar/Icon -->
        <div class="flex items-center gap-4 mb-4">
          <div
            :class="[
              'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-slate-600 group-hover:border-blue-500 transition-colors shadow-lg',
              isTaskCompleted(task) ? 'bg-emerald-600' : 'bg-blue-600',
            ]">
            <i
              :class="[
                'fa-solid',
                isTaskCompleted(task) ? 'fa-check' : 'fa-list-check',
              ]"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3
              :class="[
                'text-lg font-bold text-white truncate transition-colors',
                isTaskCompleted(task)
                  ? 'line-through opacity-60'
                  : 'group-hover:text-blue-400',
              ]">
              {{ task.description }}
            </h3>
            <p class="text-xs text-text-muted truncate flex items-center gap-1">
              <i class="fa-solid fa-briefcase text-[10px]"></i>
              {{
                task.project_name ||
                $t("admin_tasks.without_project", "Sin proyecto")
              }}
            </p>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i
              class="fa-solid fa-layer-group text-blue-400 w-5 text-center"></i>
            <span class="capitalize">{{ task.priority }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-calendar text-blue-400 w-5 text-center"></i>
            <span>{{ formatDate(task.due_date) }}</span>
          </div>
          <div
            v-if="task.tags && task.tags.length > 0"
            class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-tags text-blue-400 w-5 text-center"></i>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in task.tags.slice(0, 2)"
                :key="tag.id"
                class="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                #{{ tag.name }}
              </span>
              <span
                v-if="task.tags.length > 2"
                class="text-[10px] text-text-muted"
                >+{{ task.tags.length - 2 }}</span
              >
            </div>
          </div>

          <!-- Stats / Status Grid -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <div
              class="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <div class="text-xs text-text-muted mb-1">
                {{ t("tasks.status") }}
              </div>
              <div class="text-sm font-bold text-white truncate px-1">
                {{ task.status || task.status_name || "Unknown" }}
              </div>
            </div>
            <div
              class="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <div class="text-xs text-text-muted mb-1">
                {{ t("tasks.priority") }}
              </div>
              <!-- Using Badge component logic inline or text -->
              <div
                :class="[
                  'text-sm font-bold capitalize',
                  task.priority === 'urgent'
                    ? 'text-red-400'
                    : task.priority === 'high'
                    ? 'text-orange-400'
                    : task.priority === 'medium'
                    ? 'text-yellow-400'
                    : 'text-green-400',
                ]">
                {{ task.priority }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <!-- Assigned Users -->
          <div class="flex -space-x-2">
            <template v-if="task.users && task.users.length > 0">
              <UserAvatar
                v-for="user in task.users.slice(0, 3)"
                :key="user.id"
                :user="user"
                size="w-8 h-8" />
              <div
                v-if="task.users.length > 3"
                class="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-500 flex items-center justify-center text-[10px] text-white font-bold relative z-0"
                :title="`${task.users.length - 3} más`">
                +{{ task.users.length - 3 }}
              </div>
            </template>
            <span v-else class="text-xs text-text-muted italic px-2 py-1">{{
              t("admin_projects.details.unassigned")
            }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              v-if="!isTaskCompleted(task)"
              @click="completeTask(task)"
              class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="t('common.complete')">
              <i class="fa-solid fa-check text-sm"></i>
            </button>
            <button
              v-else
              @click="uncompleteTask(task)"
              class="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="t('admin_tasks.uncomplete') || 'Desmarcar'">
              <i class="fa-solid fa-rotate-left text-sm"></i>
            </button>

            <button
              @click="openModal(task)"
              class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="t('common.edit')">
              <i class="fa-solid fa-pen text-sm"></i>
            </button>

            <button
              @click="deleteTask(task.id)"
              class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="t('common.delete')">
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <BaseModal
      :show="showModal"
      :title="form.id ? $t('tasks.edit_task') : $t('admin_tasks.new_task')"
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Description -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            Descripción
            <span class="text-red-400 ml-1">*</span>
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
              required
              placeholder="Describe la tarea a realizar..."></textarea>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Project Select -->
          <EnhancedSelect
            v-model="form.project_id"
            :options="projects.map((p) => ({ value: p.id, label: p.name }))"
            :label="t('tasks.project')"
            :placeholder="
              t('tasks.select_project', 'Selecciona un proyecto...')
            "
            icon="fa-briefcase"
            :required="true" />

          <!-- Status Select -->
          <EnhancedSelect
            v-model="form.status_id"
            :options="statuses.map((s) => ({ value: s.id, label: s.name }))"
            :label="t('tasks.status')"
            :placeholder="t('tasks.select_status', 'Selecciona un estado...')"
            icon="fa-spinner"
            :required="true" />
        </div>

        <!-- User Assignment -->
        <MultiSelect
          v-model="form.user_ids"
          :options="
            users.map((u) => ({
              value: u.id,
              label: `${u.name} ${u.lastname} (@${u.username})`,
            }))
          "
          :label="t('admin_tasks.assign_users', 'Asignar Usuarios')"
          :placeholder="t('admin_tasks.select_users', 'Selecciona usuarios...')"
          icon="fa-users" />

        <!-- Priority Select -->
        <EnhancedSelect
          v-model="form.priority"
          :options="[
            {
              value: 'low',
              label: t('tasks.low'),
              icon: 'fa-arrow-down',
              color: 'text-green-400',
            },
            {
              value: 'medium',
              label: t('tasks.medium'),
              icon: 'fa-minus',
              color: 'text-yellow-400',
            },
            {
              value: 'high',
              label: t('tasks.high'),
              icon: 'fa-arrow-up',
              color: 'text-orange-400',
            },
            {
              value: 'urgent',
              label: t('tasks.urgent'),
              icon: 'fa-fire',
              color: 'text-red-400',
            },
          ]"
          :label="t('tasks.priority')"
          :placeholder="t('tasks.select_priority', 'Selecciona prioridad...')"
          icon="fa-layer-group" />

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-6 border-t border-slate-700/50">
          <button
            type="button"
            @click="() => closeModal(false)"
            class="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-white hover:bg-slate-700/50 transition-all duration-200 font-medium flex items-center justify-center gap-2 group">
            <i
              class="fa-solid fa-xmark group-hover:rotate-90 transition-transform duration-200"></i>
            {{ t("common.cancel") }}
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
