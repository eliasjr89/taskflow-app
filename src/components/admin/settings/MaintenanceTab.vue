<script setup lang="ts">
import { ref, onMounted } from "vue";
import adminService from "@/services/adminService";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";

const loading = ref(true);
const maintenanceMode = ref(false);
const saving = ref(false);
const toast = useToast();
const { t } = useI18n();

const fetchSettings = async () => {
  loading.value = true;
  try {
    const res = await adminService.getSettings();
    const settings = res.data.data;
    maintenanceMode.value = !!settings.MAINTENANCE_MODE;
  } catch {
    toast.error(t("common.error"), t("admin_settings.maintenance.load_error"));
  } finally {
    loading.value = false;
  }
};

const toggleMaintenance = async () => {
  saving.value = true;
  try {
    await adminService.updateSetting(
      "MAINTENANCE_MODE",
      !maintenanceMode.value
    );
    maintenanceMode.value = !maintenanceMode.value;
    toast.success(
      t("admin_settings.maintenance.toggle_success"),
      maintenanceMode.value
        ? t("admin_settings.maintenance.mode_on")
        : t("admin_settings.maintenance.mode_off")
    );
  } catch {
    toast.error(
      t("common.error"),
      t("admin_settings.maintenance.update_error")
    );
  } finally {
    saving.value = false;
  }
};

onMounted(fetchSettings);
</script>

<template>
  <div class="bg-slate-800 border border-slate-700 rounded-2xl p-8">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-xl font-bold text-white mb-2 flex items-center gap-3">
          <i class="fa-solid fa-triangle-exclamation text-amber-500"></i>
          {{ $t("admin_settings.maintenance.title") }}
        </h3>
        <p class="text-text-muted max-w-2xl leading-relaxed">
          {{ $t("admin_settings.maintenance.description") }}
        </p>
      </div>

      <button
        @click="toggleMaintenance"
        :disabled="saving"
        class="relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
        :class="maintenanceMode ? 'bg-indigo-600' : 'bg-slate-700'">
        <span class="sr-only">{{
          $t("admin_settings.maintenance.use_setting")
        }}</span>
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
          :class="maintenanceMode ? 'translate-x-6' : 'translate-x-0'" />
      </button>
    </div>

    <div
      v-if="maintenanceMode"
      class="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-center gap-3 animate-pulse">
      <i class="fa-solid fa-lock"></i>
      <span class="font-medium">
        {{ $t("admin_settings.maintenance.status_blocked") }}
      </span>
    </div>
  </div>
</template>
