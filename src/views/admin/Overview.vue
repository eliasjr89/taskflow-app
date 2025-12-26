<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";
import StatCard from "@/components/admin/StatCard.vue";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useI18n } from "vue-i18n";

const toast = useToast();
const { confirm } = useConfirm();
const { t } = useI18n();

const stats = ref({
  users: 0,
  projects: 0,
  tasks: 0,
  pendingTasks: 0,
});

const quickActions = computed(() => [
  {
    label: t("admin_dashboard.users"),
    icon: "fa-user-plus",
    route: "/admin/users",
    color: "bg-primary",
  },
  {
    label: t("admin_dashboard.projects"),
    icon: "fa-folder-plus",
    route: "/admin/projects",
    color: "bg-accent",
  },
  {
    label: t("admin_dashboard.tasks"),
    icon: "fa-list-check",
    route: "/admin/tasks",
    color: "bg-success",
  },
]);

const activities = ref<any[]>([]);
const usersMap = ref<Record<number, any>>({});
const projectsMap = ref<Record<number, any>>({});

const loading = ref(true);
const isRefreshing = ref(false);

// Helper to get user info
const getActor = (userId: number) => {
  const u = usersMap.value[userId];
  if (u)
    return {
      name: u.username,
      avatar: u.profile_image,
      id: u.id,
      role: u.role || "user",
    };
  return { name: "Sistema", avatar: null, id: 0, role: "system" };
};

const fetchActivities = async () => {
  isRefreshing.value = true;
  try {
    // Fetch All Data for Feed
    const [usersRes, projectsRes, tasksRes] = await Promise.all([
      api.get("/users"),
      api.get("/projects"),
      api.get("/tasks"),
    ]);

    // Build Maps
    if (usersRes.data.data) {
      usersRes.data.data.forEach((u: any) => {
        usersMap.value[u.id] = u;
      });
    }
    if (projectsRes.data.data) {
      projectsRes.data.data.forEach((p: any) => {
        projectsMap.value[p.id] = p;
      });
    }

    const allActivities: any[] = [];

    // --- Process USERS ---
    if (usersRes.data.data) {
      usersRes.data.data.forEach((u: any) => {
        // Created
        allActivities.push({
          date: new Date(u.created_at),
          actor: getActor(u.id),
          action: t("activity.user_created"),
          target: u.email,
          context: t("activity.context_user"),
          icon: "fa-user-plus",
          color: "bg-blue-500",
          type: "create",
        });
        // Updated
        if (u.updated_at && u.updated_at !== u.created_at) {
          allActivities.push({
            date: new Date(u.updated_at),
            actor: getActor(u.id),
            action: t("activity.user_updated"),
            target: t("activity.target_data"),
            context: t("activity.context_profile"),
            icon: "fa-user-pen",
            color: "bg-indigo-500",
            type: "update",
          });
        }
      });
    }

    // --- Process PROJECTS ---
    if (projectsRes.data.data) {
      projectsRes.data.data.forEach((p: any) => {
        // Created
        allActivities.push({
          date: new Date(p.created_at),
          actor: getActor(p.creator_id || 1),
          action: t("activity.project_created"),
          target: p.name,
          context: t("activity.context_project"),
          icon: "fa-folder-plus",
          color: "bg-purple-500",
          type: "create",
        });
        // Updated
        if (p.updated_at && p.updated_at !== p.created_at) {
          allActivities.push({
            date: new Date(p.updated_at),
            actor: getActor(p.creator_id || 1),
            action: t("activity.project_updated"),
            target: p.name,
            context: t("activity.context_project_settings"),
            icon: "fa-sliders",
            color: "bg-purple-400",
            type: "update",
          });
        }
      });
    }

    // --- Process TASKS ---
    if (tasksRes.data.data) {
      tasksRes.data.data.forEach((t: any) => {
        let actorId = 1;
        if (t.users && t.users.length > 0) actorId = t.users[0].id;
        else if (projectsMap.value[t.project_id])
          actorId = projectsMap.value[t.project_id].creator_id;

        // Created
        allActivities.push({
          date: new Date(t.created_at),
          actor: getActor(actorId),
          action: t("activity.task_created"),
          target: t.description,
          context:
            t.project_name ||
            projectsMap.value[t.project_id]?.name ||
            t("activity.context_general"),
          icon: "fa-list",
          color: "bg-emerald-500",
          type: "create",
        });

        // Completed / Updated
        if (t.updated_at && t.updated_at !== t.created_at) {
          const isCompleted =
            t.status === "completed" || t.status === "done" || t.completed;
          allActivities.push({
            date: new Date(t.updated_at),
            actor: getActor(actorId),
            action: isCompleted
              ? t("activity.task_completed")
              : t("activity.task_updated"),
            target: t.description,
            context:
              t.project_name ||
              projectsMap.value[t.project_id]?.name ||
              t("activity.context_general"),
            icon: isCompleted ? "fa-check" : "fa-pen-to-square",
            color: isCompleted ? "bg-green-500" : "bg-yellow-500",
            type: "update",
          });
        }
      });
    }

    // Sort by date desc
    allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Take top 50
    activities.value = allActivities.slice(0, 50);
  } catch {
    // Error silently - feed refresh is not critical
  } finally {
    isRefreshing.value = false;
  }
};

const deleteActivity = async () => {
  const confirmed = await confirm({
    title: t("admin_dashboard.confirm_clear_title"),
    message: t("admin_dashboard.confirm_clear_msg"),
    confirmText: t("admin_dashboard.clear_btn"),
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete("/admin/activity");
    activities.value = [];
    toast.success(
      t("admin_dashboard.history_cleared"),
      t("admin_dashboard.history_cleared_msg")
    );
  } catch {
    toast.error(
      t("admin_dashboard.clear_error"),
      t("admin_dashboard.clear_error_msg")
    );
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    // 1. Fetch Stats
    const res = await api.get("/admin/stats");
    if (res.data.success && res.data.data.rows) {
      const d = res.data.data.rows;
      stats.value = {
        users: d.users,
        projects: d.projects,
        tasks: d.tasks,
        pendingTasks: d.pending_tasks,
      };
    }

    // 2. Fetch Initial Feed
    await fetchActivities(); // Await here to keep loading true
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-8">
    <!-- Stats Grid -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-6 h-32 animate-pulse flex flex-col justify-between">
        <div class="h-4 bg-slate-700 rounded w-1/2"></div>
        <div class="h-8 bg-slate-700 rounded w-1/4"></div>
      </div>
    </div>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        :label="t('admin_dashboard.users')"
        :value="stats.users"
        icon="fa-users"
        bgGradient="from-blue-500 to-blue-600" />
      <StatCard
        :label="t('admin_dashboard.projects')"
        :value="stats.projects"
        icon="fa-briefcase"
        bgGradient="from-purple-500 to-purple-600" />
      <StatCard
        :label="t('admin_dashboard.total_tasks')"
        :value="stats.tasks"
        icon="fa-list-check"
        bgGradient="from-emerald-500 to-emerald-600" />
      <StatCard
        :label="t('admin_dashboard.pending')"
        :value="stats.pendingTasks"
        icon="fa-clock"
        bgGradient="from-orange-500 to-red-500" />
    </div>

    <!-- Quick Actions -->
    <div
      class="bg-slate-800/70 border border-white/10 rounded-xl shadow-sm p-8">
      <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
        <i class="fa-solid fa-bolt text-yellow-400"></i>
        {{ $t("admin_dashboard.quick_actions") }}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          v-for="action in quickActions"
          :key="action.label"
          @click="$router.push(action.route)"
          class="group relative overflow-hidden rounded-xl bg-slate-700 border border-slate-600 p-6 hover:bg-slate-600 transition-all text-left">
          <div class="relative z-10 flex items-center gap-4">
            <div
              :class="`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-white shadow-lg`">
              <i :class="['fa-solid', action.icon]"></i>
            </div>
            <span class="font-bold text-lg">{{ action.label }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Recent Activity Feed -->
    <div
      class="bg-slate-800/70 border border-white/10 rounded-xl shadow-sm p-8">
      <h3 class="text-xl font-bold mb-6 flex items-center gap-2">
        <button
          @click="fetchActivities"
          :disabled="isRefreshing || loading"
          class="focus:outline-none hover:bg-slate-700/50 p-1.5 -ml-1.5 rounded-lg transition-all"
          :title="$t('admin_dashboard.refresh')">
          <i
            :class="[
              'fa-solid fa-clock-rotate-left text-blue-400 text-xl',
              isRefreshing ? 'animate-spin' : '',
            ]"></i>
        </button>
        {{ $t("admin_dashboard.recent_activity") }}
        <button
          @click="deleteActivity"
          :disabled="isRefreshing || loading || activities.length === 0"
          class="ml-auto focus:outline-none hover:bg-rose-500/10 p-2 rounded-lg transition-all text-rose-500 disabled:opacity-30 disabled:grayscale"
          :title="$t('admin_dashboard.clear_history')">
          <i class="fa-solid fa-trash-can text-lg"></i>
        </button>
      </h3>

      <!-- Skeleton Loading for Feed -->
      <div v-if="loading" class="space-y-8">
        <div
          v-for="i in 3"
          :key="i"
          class="flex gap-6 items-start pl-8 ml-4 animate-pulse relative">
          <!-- Timeline Line -->
          <div class="absolute left-0 top-0 bottom-0 w-px bg-slate-700"></div>
          <!-- Avatar -->
          <div
            class="absolute -left-5 top-0 w-10 h-10 rounded-full bg-slate-700"></div>

          <div class="flex-1 space-y-3">
            <div class="flex gap-2">
              <div class="h-4 bg-slate-700 rounded w-20"></div>
              <div class="h-4 bg-slate-700 rounded w-32"></div>
            </div>
            <div class="h-4 bg-slate-700 rounded w-3/4"></div>
            <div class="h-3 bg-slate-700 rounded w-24"></div>
          </div>
        </div>
      </div>

      <div v-else-if="activities.length === 0" class="text-text-muted italic">
        {{ $t("admin_dashboard.no_activity") }}
      </div>

      <div v-else class="space-y-0">
        <div
          v-for="(act, index) in activities"
          :key="index"
          class="flex gap-6 items-start relative pb-10 border-l border-slate-700/50 pl-8 ml-4 last:border-0 last:pb-0 group">
          <!-- Timeline Icon/Avatar -->
          <div
            class="absolute -left-5 top-0 w-10 h-10 rounded-full bg-slate-800 border-4 border-bg-dark flex items-center justify-center shrink-0 z-10 overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300">
            <img
              v-if="act.actor.avatar"
              :src="act.actor.avatar"
              class="w-full h-full object-cover" />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-slate-700 text-white font-bold text-xs">
              {{ act.actor.name.charAt(0).toUpperCase() }}
            </div>

            <!-- Tiny Type Dot -->
            <div
              :class="`absolute bottom-0 right-0 w-3 h-3 rounded-full ${act.color} ring-2 ring-slate-800`"></div>
          </div>

          <div class="flex-1 w-full relative -top-1">
            <!-- Top Row: Role Badge + Name + Time -->
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span
                :class="`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  act.actor.role === 'admin'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : act.actor.role === 'manager'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`">
                {{ act.actor.role === "system" ? "SISTEMA" : act.actor.role }}
              </span>
              <span class="text-base font-bold text-white">{{
                act.actor.name
              }}</span>
              <span class="text-xs text-text-muted ml-auto">
                {{ act.date.toLocaleDateString() }} ·
                {{
                  act.date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }}
              </span>
            </div>

            <!-- Middle Row: Action + Target -->
            <p class="text-sm text-gray-300 mb-2 leading-relaxed">
              <span>{{ act.action }}</span>
              <span class="font-medium text-white mx-1"
                >"{{ act.target }}"</span
              >
            </p>

            <!-- Context (Minimal) -->
            <div class="flex items-center gap-2 text-xs text-text-muted/60">
              <i :class="['fa-solid', act.icon, 'opacity-70']"></i>
              <span>{{ act.context }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles removed */
</style>
