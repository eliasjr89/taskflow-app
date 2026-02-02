<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";
import type { User } from "@/types";
import BaseModal from "@/components/common/BaseModal.vue";
import adminService from "@/services/adminService";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import EnhancedSelect from "@/components/common/EnhancedSelect.vue";
import MultiSelect from "@/components/common/MultiSelect.vue";
import { useI18n } from "vue-i18n";

const toast = useToast();
const { confirm } = useConfirm();
const { t, locale } = useI18n();

const users = ref<User[]>([]);
const tasksList = ref<any[]>([]); // For MultiSelect
const expandedUsers = ref<
  Record<number, { projects: boolean; tasks: boolean }>
>({});

const toggleExpand = (userId: number, type: "projects" | "tasks") => {
  if (!expandedUsers.value[userId]) {
    expandedUsers.value[userId] = { projects: false, tasks: false };
  }
  expandedUsers.value[userId][type] = !expandedUsers.value[userId][type];
};
const loading = ref(true);
const showModal = ref(false);

const submitting = ref(false);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string>("");

const impersonate = async (user: User) => {
  const confirmed = await confirm({
    title: t("admin_users.impersonate_confirm"),
    message: t("admin_users.impersonate_msg", { user: user.username }),
    confirmText: t("admin_users.impersonate_btn"),
    type: "warning",
  });

  if (!confirmed) return;

  try {
    const res = await adminService.impersonateUser(user.id);
    const { token, user: newUser } = res.data.data;

    // Manually update session
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));

    // Force reload to apply changes cleanly (simplest way to reset all stores)
    window.location.href = "/";
  } catch {
    toast.error(t("common.error_title"), t("admin_users.impersonate_error"));
  }
};

const form = ref({
  id: null as number | null,
  username: "",
  email: "",
  name: "",
  lastname: "",
  role: "user" as "user" | "manager" | "admin",
  password: "",
  profile_image: "",
  task_ids: [] as number[],
});

const roles = computed(() => [
  { value: "user", label: t("admin_users.roles.user"), icon: "fa-user" },
  {
    value: "manager",
    label: t("admin_users.roles.manager"),
    icon: "fa-user-tie",
  },
  {
    value: "admin",
    label: t("admin_users.roles.admin"),
    icon: "fa-user-shield",
  },
]);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/users");
    users.value = res.data.data;
  } catch {
    toast.error(t("common.error_title"), t("common.load_error"));
  } finally {
    loading.value = false;
  }
};

const fetchTasksList = async () => {
  try {
    const res = await api.get("/tasks?limit=1000"); // Fetch all tasks for selection
    const data = res.data.data || res.data;
    tasksList.value = Array.isArray(data) ? data : data.results || [];
  } catch {
    // Silent fail or toast
  }
};

const openModal = async (user?: User) => {
  // Ensure tasks list is loaded
  if (tasksList.value.length === 0) {
    await fetchTasksList();
  }

  if (user) {
    // Fetch currently assigned tasks
    let userTaskIds: number[] = [];
    try {
      const res = await api.get(`/tasks?user_id=${user.id}&limit=1000`);
      const tasks = res.data.data || res.data || [];
      const list = Array.isArray(tasks) ? tasks : tasks.results || [];
      userTaskIds = list.map((t: any) => t.id);
    } catch {
      // ignore
    }

    form.value = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      role: user.role as "user" | "manager" | "admin",
      password: "",
      profile_image: user.profile_image || "",
      task_ids: userTaskIds,
    };
    imagePreview.value = user.profile_image || "";
  } else {
    form.value = {
      id: null,
      username: "",
      email: "",
      name: "",
      lastname: "",
      role: "user",
      password: "",
      profile_image: "",
      task_ids: [],
    };
    imagePreview.value = "";
  }
  imageFile.value = null;
  showModal.value = true;
};

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("common.error_title"), t("common.image_size_error"));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(t("common.error_title"), t("common.image_type_error"));
      return;
    }

    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const closeModal = async (force: boolean = false) => {
  if (typeof force !== "boolean") force = false; // Fix for template event args

  if (!force && (form.value.username || form.value.email)) {
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
    username: "",
    email: "",
    name: "",
    lastname: "",
    role: "user",
    password: "",
    profile_image: "",
    task_ids: [],
  };
  imageFile.value = null;
  imagePreview.value = "";
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("username", form.value.username);
    formData.append("email", form.value.email);
    formData.append("name", form.value.name);
    formData.append("lastname", form.value.lastname);
    formData.append("role", form.value.role);

    if (form.value.password) {
      formData.append("password", form.value.password);
    }

    if (imageFile.value) {
      formData.append("profile_image", imageFile.value);
    }

    // Handle task_ids - FormData doesn't support arrays directly in standard ways sometimes,
    // but usually appending multiple keys works: task_ids[], or just JSON stringify for a specific field if backend expects it.
    // However, our backend expects JSON body usually. But here we are using FormData for image upload.
    // The `hppMiddleware` in backend might handle array if appended multiple times.
    // Let's iterate.
    if (form.value.task_ids && form.value.task_ids.length > 0) {
      form.value.task_ids.forEach((id) => {
        formData.append("task_ids", String(id));
      });
      // Note: Backend might need to check fields logic.
      // User Controller uses `req.body`. Multer parses text fields.
      // If `task_ids[]` is sent, express `hpp` or body parser should handle it.
      // But `TasksView` uses JSON. `UsersView` uses FormData.
      // Important to verify if Backend `req.body` will have `task_ids` as array.
    }

    if (form.value.id) {
      await api.put(`/users/${form.value.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        t("admin_users.update_success"),
        t("admin_users.update_msg"),
      );
    } else {
      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        t("admin_users.create_success"),
        t("admin_users.create_msg"),
      );
    }

    await fetchUsers();
    closeModal(true);
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || t("common.save_error");
    toast.error(t("common.error_title"), errorMsg);
  } finally {
    submitting.value = false;
  }
};

const deleteUser = async (id: number) => {
  const confirmed = await confirm({
    title: t("admin_users.delete_confirm"),
    message: t("admin_users.delete_msg"),
    confirmText: t("common.delete"),
    cancelText: t("common.cancel"),
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete(`/users/${id}`);
    users.value = users.value.filter((u) => u.id !== id);
    toast.success(
      t("admin_users.delete_success"),
      t("admin_users.delete_success_msg"),
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

onMounted(fetchUsers);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">
          {{ $t("admin_users.title") }}
        </h2>
        <p class="text-text-muted">
          {{ $t("admin_users.subtitle") }}
        </p>
      </div>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>{{ $t("admin_users.new_user") }}</span>
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
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-slate-700 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-slate-700 rounded w-1/3"></div>
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="h-6 bg-slate-700 rounded w-20"></div>
          <div class="flex gap-2">
            <div class="w-8 h-8 bg-slate-700 rounded cursor-pointer"></div>
            <div class="w-8 h-8 bg-slate-700 rounded cursor-pointer"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Cards Grid -->
    <div
      v-else-if="users.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="user in users"
        :key="user.id"
        class="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
        <!-- Header with Avatar -->
        <div class="flex items-center gap-4 mb-4">
          <img
            v-if="user.profile_image"
            :src="user.profile_image"
            :alt="$t('profile.form.profile_image')"
            class="w-14 h-14 rounded-full object-cover border-2 border-slate-600 group-hover:border-indigo-500 transition-colors" />
          <div
            v-else
            class="w-14 h-14 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-600 group-hover:border-indigo-500 transition-colors shadow-lg">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
              {{ user.name }} {{ user.lastname }}
            </h3>
            <p class="text-xs text-text-muted truncate">@{{ user.username }}</p>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-envelope text-indigo-400 w-5 text-center"></i>
            <span class="truncate">{{ user.email }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-calendar text-indigo-400 w-5 text-center"></i>
            <span
              >{{ $t("admin_users.joined") }}
              {{ formatDate(user.created_at) }}</span
            >
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <div
              class="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <div class="text-xs text-text-muted mb-1">
                {{ $t("nav.tasks") }}
              </div>
              <div class="text-lg font-bold text-white">
                {{ user.num_tasks || 0 }}
              </div>
            </div>
            <div
              class="bg-white/5 rounded-lg p-2 text-center border border-white/5">
              <div class="text-xs text-text-muted mb-1">
                {{ $t("nav.projects") }}
              </div>
              <div class="text-lg font-bold text-white">
                {{ user.num_projects || 0 }}
              </div>
            </div>
          </div>

          <!-- Mini Lists for Projects & Tasks -->
          <div class="space-y-4 pt-2 border-t border-slate-700/30">
            <!-- Projects -->
            <div v-if="user.projects && user.projects.length > 0">
              <h4
                class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i class="fa-solid fa-folder-open text-indigo-400"></i>
                {{ $t("nav.projects") }}
              </h4>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="p in expandedUsers[user.id]?.projects
                    ? user.projects
                    : user.projects.slice(0, 3)"
                  :key="p.id"
                  class="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-medium truncate max-w-[120px]"
                  :title="p.name">
                  {{ p.name }}
                </span>
                <span
                  v-if="user.projects.length > 3"
                  @click="toggleExpand(user.id, 'projects')"
                  class="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold self-center cursor-pointer transition-colors">
                  {{
                    expandedUsers[user.id]?.projects
                      ? $t("common.close")
                      : `+${user.projects.length - 3}`
                  }}
                </span>
              </div>
            </div>

            <!-- Tasks -->
            <div v-if="user.tasks && user.tasks.length > 0">
              <h4
                class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <i class="fa-solid fa-list-check text-indigo-400"></i>
                {{ $t("nav.tasks") }}
              </h4>
              <div class="space-y-1">
                <div
                  v-for="t in expandedUsers[user.id]?.tasks
                    ? user.tasks
                    : user.tasks.slice(0, 2)"
                  :key="t.id"
                  class="text-[11px] text-gray-300 flex items-start gap-2 line-clamp-1">
                  <i
                    class="fa-solid fa-circle text-[4px] mt-1.5 text-indigo-500/40"></i>
                  <span class="truncate">{{ t.description }}</span>
                </div>
                <div
                  v-if="user.tasks.length > 2"
                  @click="toggleExpand(user.id, 'tasks')"
                  class="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors pl-3 mt-1 inline-block">
                  {{
                    expandedUsers[user.id]?.tasks
                      ? $t("common.close")
                      : $t("common.more", { n: user.tasks.length - 2 })
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <span
            :class="`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
              user.role === 'admin'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : user.role === 'manager'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`">
            <i
              :class="
                user.role === 'admin'
                  ? 'fa-solid fa-shield-halved'
                  : user.role === 'manager'
                    ? 'fa-solid fa-user-tie'
                    : 'fa-solid fa-user'
              "></i>
            {{ user.role }}
          </span>

          <div class="flex gap-2">
            <button
              @click="openModal(user)"
              class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="$t('common.edit')">
              <i class="fa-solid fa-pen text-sm"></i>
            </button>

            <button
              @click="impersonate(user)"
              class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center justify-center hover:scale-110"
              :title="$t('admin_users.impersonate')">
              <i class="fa-solid fa-user-secret text-sm"></i>
            </button>
            <button
              @click="deleteUser(user.id)"
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
        <i class="fa-solid fa-users text-4xl text-text-muted"></i>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">
        {{ $t("admin_users.empty_title") }}
      </h3>
      <p class="text-text-muted mb-6">
        {{ $t("admin_users.empty_msg") }}
      </p>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
        <i class="fa-solid fa-plus mr-2"></i>
        {{ $t("admin_users.create_first") }}
      </button>
    </div>

    <!-- User Modal -->
    <BaseModal
      :show="showModal"
      :title="
        form.id ? $t('admin_users.edit_user') : $t('admin_users.new_user')
      "
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Profile Image Upload -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            {{ $t("profile.form.profile_image") }}
          </label>
          <div class="flex items-center gap-4">
            <div class="relative">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                :alt="$t('profile.form.profile_image')"
                class="w-20 h-20 rounded-full object-cover border-2 border-primary" />
              <div
                v-else
                class="w-20 h-20 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-2xl">
                {{ form.username?.charAt(0).toUpperCase() || "?" }}
              </div>
              <label
                class="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors shadow-lg">
                <i class="fa-solid fa-camera text-white text-xs"></i>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  class="hidden" />
              </label>
            </div>
            <div class="text-sm text-gray-400">
              <p>{{ $t("admin_users.upload_hint") }}</p>
              <p>{{ $t("admin_users.upload_formats") }}</p>
            </div>
          </div>
        </div>

        <!-- Username and Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              {{ $t("auth.username") }} <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.username"
              type="text"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              :placeholder="$t('auth.username_placeholder')" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              {{ $t("auth.email") }} <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              :placeholder="$t('auth.email_placeholder')" />
          </div>
        </div>

        <!-- Name and Lastname -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              {{ $t("auth.first_name") }} <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              :placeholder="$t('auth.first_name_placeholder')" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              {{ $t("auth.last_name") }} <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.lastname"
              type="text"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              :placeholder="$t('auth.last_name_placeholder')" />
          </div>
        </div>

        <!-- Role and Password -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnhancedSelect
            v-model="form.role"
            :label="$t('profile.role')"
            icon="fa-user-shield"
            :options="roles"
            :required="true"
            :placeholder="$t('common.filter')" />

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              {{ $t("auth.password") }} {{ form.id ? "" : "*" }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!form.id"
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              :placeholder="
                form.id ? $t('admin_users.password_hint') : '••••••••'
              " />
          </div>
        </div>

        <div class="space-y-4">
          <!-- Task Assignment -->
          <MultiSelect
            v-model="form.task_ids"
            :options="
              tasksList.map((t) => ({ value: t.id, label: t.description }))
            "
            :label="$t('admin_users.assign_tasks')"
            :placeholder="$t('admin_users.select_tasks')"
            icon="fa-list-check" />
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

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Ensure smooth transition for move */
.list-move {
  transition: transform 0.3s ease;
}
</style>
