<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import adminService from "@/services/adminService";
import { useToast } from "@/composables/useToast";
import EnhancedSelect from "@/components/common/EnhancedSelect.vue";
import { useI18n } from "vue-i18n";

const logs = ref<any[]>([]);
const loading = ref(true);
const toast = useToast();
const { t, locale } = useI18n();

const filters = ref({
  page: 1,
  limit: 20,
  action: "",
  entityType: "",
  userId: "",
});

const totalLogs = ref(0);

const actionOptions = computed(() => [
  { value: "", label: t("admin_audit.actions.all") },
  { value: "create", label: t("admin_audit.actions.create") },
  { value: "update", label: t("admin_audit.actions.update") },
  { value: "delete", label: t("admin_audit.actions.delete") },
  { value: "login", label: t("admin_audit.actions.login") },
  { value: "impersonate", label: t("admin_audit.actions.impersonate") },
]);

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await adminService.getAuditLogs({
      page: filters.value.page,
      limit: filters.value.limit,
      ...(filters.value.action && { action: filters.value.action }),
      ...(filters.value.entityType && { entityType: filters.value.entityType }),
      ...(filters.value.userId && { userId: filters.value.userId }),
    });
    // Backend pagination response might vary, adapting safely
    const data = res.data.data;
    if (Array.isArray(data)) {
      logs.value = data;
      totalLogs.value = data.length; // Approximate if no meta
    } else {
      logs.value = data.logs || data.results || [];
      totalLogs.value = data.total || logs.value.length;
    }
  } catch {
    toast.error(t("common.error_title"), t("admin_audit.load_error"));
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLogs);

watch(
  () => [filters.value.action],
  () => {
    filters.value.page = 1;
    fetchLogs();
  }
);

const getActionColor = (action: string) => {
  const code = action?.toLowerCase();
  if (code?.includes("delete")) return "text-red-400 bg-red-500/10";
  if (code?.includes("create")) return "text-emerald-400 bg-emerald-500/10";
  if (code?.includes("update")) return "text-amber-400 bg-amber-500/10";
  if (code?.includes("login")) return "text-blue-400 bg-blue-500/10";
  return "text-indigo-400 bg-indigo-500/10";
};

const formatAction = (action: string) => {
  if (!action) return "-";
  const key = action.toLowerCase().replace(/\s+/g, "_");
  const translated = t(`admin_audit.actions.${key}`);
  // Fallback to original if translation key not found (returns key if not found in some setups, but here we expect the key)
  return translated !== `admin_audit.actions.${key}` ? translated : action;
};

const getRelativeTime = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Use current locale
  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: "auto" });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, "second");
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return rtf.format(-diffInMinutes, "minute");
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return rtf.format(-diffInHours, "hour");
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return rtf.format(-diffInDays, "day");
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return rtf.format(-diffInMonths, "month");
  return rtf.format(-Math.floor(diffInDays / 365), "year");
};

const formatDateFull = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString(
    locale.value === "es" ? "es-ES" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "medium",
    }
  );
};

const formatEntityType = (type: string) => {
  if (!type) return "-";
  const key = type.toLowerCase();
  const translated = t(`admin_audit.entities.${key}`);
  return translated !== `admin_audit.entities.${key}` ? translated : type;
};

const formatDetails = (details: any) => {
  if (!details) return [];
  if (typeof details === "string") return [{ key: "Info", value: details }];

  return Object.entries(details).map(([key, value]) => {
    const translationKey = `admin_audit.dictionary.${key}`;
    const translatedKey = t(translationKey);
    const finalKey =
      translatedKey !== translationKey
        ? translatedKey
        : key.charAt(0).toUpperCase() + key.slice(1);

    let finalValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    // Translate common values if possible
    if (typeof value === "string") {
      const valueKey = `admin_audit.dictionary.values.${value.toLowerCase()}`;
      const translatedValue = t(valueKey);
      if (translatedValue !== valueKey) {
        finalValue = translatedValue;
      }
    }

    return { key: finalKey, value: finalValue };
  });
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-2xl font-bold text-white">
          {{ $t("admin_audit.title") }}
        </h2>
        <p class="text-text-muted">
          {{ $t("admin_audit.subtitle") }}
        </p>
      </div>

      <!-- Simple Filters -->
      <div class="flex gap-4">
        <div class="w-48">
          <EnhancedSelect
            v-model="filters.action"
            :options="actionOptions"
            :placeholder="$t('admin_audit.filter_placeholder')"
            icon="fa-filter"
            :allow-clear="true" />
        </div>
        <button
          @click="fetchLogs"
          class="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          :title="$t('admin_audit.refresh')">
          <i
            class="fa-solid fa-rotate-right"
            :class="{ 'fa-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Logs Table -->
    <div
      class="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="bg-slate-900/50 border-b border-white/5 text-gray-400 text-sm uppercase tracking-wider">
              <th class="px-6 py-4 font-bold">
                {{ $t("admin_audit.columns.user") }}
              </th>
              <th class="px-6 py-4 font-bold">
                {{ $t("admin_audit.columns.action") }}
              </th>
              <th class="px-6 py-4 font-bold">
                {{ $t("admin_audit.columns.resource") }}
              </th>
              <th class="px-6 py-4 font-bold">
                {{ $t("admin_audit.columns.details") }}
              </th>
              <th class="px-6 py-4 font-bold">
                {{ $t("admin_audit.columns.date") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-if="loading && logs.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-500">
                {{ $t("admin_audit.loading") }}
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-500">
                {{ $t("admin_audit.empty") }}
              </td>
            </tr>
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-white/5 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {{ log.user?.username?.charAt(0).toUpperCase() || "?" }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">
                      {{ log.user?.username || $t("admin_audit.unknown_user") }}
                    </p>
                    <p class="text-xs text-text-muted">
                      {{
                        (log.ipAddress || $t("admin_audit.unknown_ip")).replace(
                          "::ffff:",
                          ""
                        )
                      }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-white/5"
                  :class="getActionColor(log.action.toLowerCase())">
                  {{ formatAction(log.action) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-300">
                <span class="font-mono text-xs bg-black/20 px-2 py-1 rounded">
                  {{ formatEntityType(log.entityType) }}: {{ log.entityId }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="log.details" class="flex flex-col gap-1 text-xs">
                  <div
                    v-for="(item, idx) in formatDetails(log.details)"
                    :key="idx"
                    class="flex gap-1">
                    <span class="font-medium text-indigo-300"
                      >{{ item.key }}:</span
                    >
                    <span
                      class="text-gray-400 truncate max-w-[150px]"
                      :title="item.value"
                      >{{ item.value }}</span
                    >
                  </div>
                </div>
                <span v-else class="text-gray-600 text-xs">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                <div class="flex flex-col">
                  <span class="text-white">{{
                    formatDateFull(log.createdAt)
                  }}</span>
                  <span class="text-xs opacity-60">
                    {{ getRelativeTime(log.createdAt) }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Load More / Pagination (Simplified) -->
      <div
        v-if="logs.length > 0"
        class="p-4 border-t border-white/5 flex justify-center">
        <button
          v-if="logs.length < totalLogs"
          @click="
            () => {
              filters.limit += 20;
              fetchLogs();
            }
          "
          class="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
          {{ $t("admin_audit.load_more") }}
        </button>
        <span v-else class="text-xs text-gray-500">{{
          $t("admin_audit.showing", { n: logs.length })
        }}</span>
      </div>
    </div>
  </div>
</template>
