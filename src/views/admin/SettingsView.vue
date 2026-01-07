<script setup lang="ts">
import { ref, computed } from "vue";
import MaintenanceTab from "@/components/admin/settings/MaintenanceTab.vue";
import WebhooksTab from "@/components/admin/settings/WebhooksTab.vue";
import AnnouncementsTab from "@/components/admin/settings/AnnouncementsTab.vue";
import { useI18n } from "vue-i18n";

const activeTab = ref("maintenance");
const { t } = useI18n();

const tabs = computed(() => [
  {
    id: "maintenance",
    label: t("admin_settings.tabs.general"),
    icon: "fa-sliders",
  },
  { id: "webhooks", label: t("admin_settings.tabs.webhooks"), icon: "fa-plug" },
  {
    id: "announcements",
    label: t("admin_settings.tabs.announcements"),
    icon: "fa-bullhorn",
  },
]);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-white">
        {{ $t("admin_settings.title") }}
      </h2>
      <p class="text-text-muted">
        {{ $t("admin_settings.subtitle") }}
      </p>
    </div>

    <!-- Tabs Header -->
    <div
      class="flex space-x-1 rounded-xl bg-slate-800/50 p-1 border border-white/5 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-2 w-full rounded-lg py-2.5 px-6 text-sm font-medium leading-5 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 transition-all duration-300"
        :class="[
          activeTab === tab.id
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            : 'text-gray-400 hover:bg-white/12 hover:text-white',
        ]">
        <i class="fa-solid" :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="transition-all duration-300 fade-in">
      <MaintenanceTab v-if="activeTab === 'maintenance'" />
      <WebhooksTab v-if="activeTab === 'webhooks'" />
      <AnnouncementsTab v-if="activeTab === 'announcements'" />
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
