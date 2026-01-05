<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import { useI18n } from "vue-i18n";
import ProgressBar from "@/components/common/ProgressBar.vue";

interface DBStats {
  total_size: string;
  version: string;
  uptime: {
    hours?: number;
    minutes?: number;
    seconds?: number;
    days?: number;
  };
  active_connections: number;
  rows: {
    users: number;
    projects: number;
    tasks: number;
  };
  tables: Array<{
    table_name: string;
    row_count: number;
  }>;
}

const stats = ref<DBStats | null>(null);
const loading = ref(true);
const resetting = ref(false);
const { t } = useI18n();

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await api.get("/admin/stats");
    if (res.data.success) {
      stats.value = res.data.data;
    }
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
};

const resetDatabase = async () => {
  if (!confirm(t("admin_database.reset_confirm"))) return;

  try {
    await api.post("/admin/reset-db");
    alert(t("admin_database.reset_success"));
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/login";
  } catch {
    alert(t("admin_database.reset_error"));
  }
};

onMounted(fetchStats);
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold text-white">
        {{ t("admin_database.title") }}
      </h2>
      <p class="text-text-muted">{{ t("admin_database.subtitle") }}</p>
    </div>

    <!-- Loading -->
    <!-- Skeleton Loader -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
        class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 h-[400px] animate-pulse flex flex-col gap-6">
        <div class="h-6 w-1/3 bg-slate-700 rounded"></div>
        <div class="h-10 w-full bg-slate-700 rounded-lg"></div>
        <div class="h-4 w-1/2 bg-slate-700 rounded"></div>
        <div class="flex-1 bg-slate-700/50 rounded-lg mt-4"></div>
      </div>
      <div
        class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 h-[400px] animate-pulse flex flex-col gap-6">
        <div class="h-6 w-1/3 bg-slate-700 rounded"></div>
        <div class="h-24 w-full bg-slate-700 rounded-xl"></div>
        <div class="flex-1 bg-slate-700/50 rounded-xl mt-4"></div>
      </div>
    </div>

    <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Storage Usage -->
      <div
        class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <i class="fa-solid fa-hard-drive text-blue-400"></i>
          {{ t("admin_database.storage") }}
        </h3>

        <div class="mb-2 flex justify-between text-sm text-text-muted">
          <span>{{ t("admin_database.used_space") }}</span>
          <span class="text-white font-mono">{{ stats.total_size }}</span>
        </div>
        <!-- Animated Progress -->
        <div class="mb-6">
          <ProgressBar
            :percentage="45"
            colorClass="bg-linear-to-r from-blue-500 to-cyan-400"
            bgClass="bg-black/30 h-4" />
        </div>

        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <i class="fa-solid fa-table text-purple-400"></i>
          {{ t("admin_database.records") }}
        </h3>
        <div class="space-y-4">
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <span
                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-200 bg-blue-200/10">
                {{ t("admin_dashboard.users") }}
              </span>
              <div class="text-right">
                <span class="text-xs font-semibold inline-block text-blue-200">
                  {{ stats.rows.users }}
                </span>
              </div>
            </div>
            <ProgressBar
              :percentage="stats.rows.users * 5"
              colorClass="bg-blue-500"
              bgClass="bg-blue-200/10 mb-4" />
          </div>

          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <span
                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-200 bg-purple-200/10">
                {{ t("admin_dashboard.projects") }}
              </span>
              <div class="text-right">
                <span
                  class="text-xs font-semibold inline-block text-purple-200">
                  {{ stats.rows.projects }}
                </span>
              </div>
            </div>
            <ProgressBar
              :percentage="stats.rows.projects * 5"
              colorClass="bg-purple-500"
              bgClass="bg-purple-200/10 mb-4" />
          </div>

          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <span
                class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-200 bg-emerald-200/10">
                {{ t("admin_dashboard.tasks") }}
              </span>
              <div class="text-right">
                <span
                  class="text-xs font-semibold inline-block text-emerald-200">
                  {{ stats.rows.tasks }}
                </span>
              </div>
            </div>
            <ProgressBar
              :percentage="stats.rows.tasks * 2"
              colorClass="bg-emerald-500"
              bgClass="bg-emerald-200/10 mb-4" />
          </div>
        </div>
      </div>

      <!-- Health & Actions -->
      <div
        class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i class="fa-solid fa-heart-pulse text-red-400"></i>
            {{ t("admin_database.health") }}
          </h3>
          <div
            class="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
              <i class="fa-solid fa-check"></i>
            </div>
            <div>
              <h4 class="font-bold text-white">
                {{ t("admin_database.online") }}
              </h4>
              <p class="text-sm text-green-200/70">
                {{ t("admin_database.online_msg") }}
              </p>
            </div>
          </div>

          <!-- Extended Metadata -->
          <div class="mt-6 space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-text-muted">{{
                t("admin_database.version")
              }}</span>
              <span class="text-white font-mono bg-white/5 px-2 py-1 rounded">{{
                stats.version.split(",")[0]
              }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-text-muted">{{
                t("admin_database.active_connections")
              }}</span>
              <span class="text-white font-bold">{{
                stats.active_connections
              }}</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-text-muted">{{
                t("admin_database.uptime")
              }}</span>
              <span class="text-white font-mono">
                {{ stats.uptime.days || 0 }}d {{ stats.uptime.hours || 0 }}h
                {{ stats.uptime.minutes || 0 }}m
              </span>
            </div>
          </div>
        </div>

        <!-- Tables Table -->
        <div
          class="mt-8 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl col-span-1 md:col-span-2">
          <div
            class="px-6 py-4 border-b border-slate-700 bg-slate-700/30 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-list-check text-indigo-400"></i>
              {{ t("admin_database.table_stats") }}
            </h3>
            <span
              class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
              >{{ stats.tables.length }}
              {{ t("admin_database.public_tables") }}</span
            >
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr
                  class="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700">
                  <th class="px-6 py-4">
                    {{ t("admin_database.table_header") }}
                  </th>
                  <th class="px-6 py-4 text-right">
                    {{ t("admin_database.rows_header") }}
                  </th>
                  <th class="px-6 py-4 text-right">
                    {{ t("admin_database.health_header") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr
                  v-for="table in stats.tables"
                  :key="table.table_name"
                  class="hover:bg-white/5 transition-colors">
                  <td
                    class="px-6 py-4 text-white font-medium flex items-center gap-2">
                    <i
                      class="fa-solid fa-database text-blue-500/50 text-[10px]"></i>
                    {{ table.table_name }}
                  </td>
                  <td
                    class="px-6 py-4 text-right text-slate-300 font-mono text-sm">
                    {{ table.row_count }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span
                      class="h-1.5 w-1.5 rounded-full inline-block bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] mr-2"></span>
                    <span
                      class="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest"
                      >{{ t("admin_database.optimal") }}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-8 border-t border-white/5 pt-8 col-span-1 md:col-span-2">
          <div
            class="glass-card-admin p-8 text-center border-t-4 border-danger">
            <h3 class="text-xl font-bold text-white mb-4">
              {{ t("admin_database.danger_zone") }}
            </h3>
            <p class="text-text-muted mb-6 max-w-xl mx-auto">
              {{ t("admin_database.danger_msg") }}
            </p>
            <button
              @click="resetDatabase"
              :disabled="resetting"
              class="px-6 py-3 bg-linear-to-r from-red-500 to-red-700 text-white font-bold rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fa-solid fa-radiation"></i>
              {{ t("admin_database.reset_btn") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
