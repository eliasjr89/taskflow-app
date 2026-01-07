<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import adminService from "@/services/adminService";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useI18n } from "vue-i18n";

const webhooks = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);
const toast = useToast();
const { confirm } = useConfirm();
const { t } = useI18n();

const form = ref({
  url: "",
  events: [] as string[],
  secret: "",
});

const availableEvents = computed(() => [
  {
    value: "task.created",
    label: t("admin_settings.webhooks.events.task_created"),
  },
  {
    value: "task.updated",
    label: t("admin_settings.webhooks.events.task_updated"),
  },
  {
    value: "task.deleted",
    label: t("admin_settings.webhooks.events.task_deleted"),
  },
  {
    value: "user.registered",
    label: t("admin_settings.webhooks.events.user_registered"),
  },
  {
    value: "project.created",
    label: t("admin_settings.webhooks.events.project_created"),
  },
]);

const fetchWebhooks = async () => {
  loading.value = true;
  try {
    const res = await adminService.getWebhooks();
    webhooks.value = res.data.data;
  } catch {
    toast.error(t("common.error"), t("admin_settings.webhooks.errors.load"));
  } finally {
    loading.value = false;
  }
};

const createWebhook = async () => {
  if (form.value.events.length === 0) {
    toast.error(
      t("common.error"),
      t("admin_settings.webhooks.errors.no_events")
    );
    return;
  }
  submitting.value = true;
  try {
    await adminService.createWebhook(form.value);
    toast.success(
      t("admin_settings.webhooks.create_title"),
      t("admin_settings.webhooks.create_success")
    );
    showModal.value = false;
    form.value = { url: "", events: [], secret: "" };
    fetchWebhooks();
  } catch {
    toast.error(t("common.error"), t("admin_settings.webhooks.errors.create"));
  } finally {
    submitting.value = false;
  }
};

const deleteWebhook = async (id: number) => {
  const confirmed = await confirm({
    title: t("admin_settings.webhooks.delete_title"),
    message: t("admin_settings.webhooks.delete_confirm"),
    type: "danger",
  });
  if (!confirmed) return;

  try {
    await adminService.deleteWebhook(id);
    webhooks.value = webhooks.value.filter((w) => w.id !== id);
    toast.success(
      t("common.success"),
      t("admin_settings.webhooks.delete_success")
    );
  } catch {
    toast.error(t("common.error"), t("admin_settings.webhooks.errors.delete"));
  }
};

onMounted(fetchWebhooks);

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <button
        @click="showModal = true"
        class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
        <i class="fa-solid fa-plus"></i>
        {{ $t("admin_settings.webhooks.new_webhook") }}
      </button>
    </div>

    <!-- List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-if="loading && webhooks.length === 0"
        class="col-span-2 text-center py-8 text-gray-500">
        {{ $t("admin_settings.webhooks.loading") }}
      </div>
      <div
        v-else-if="webhooks.length === 0"
        class="col-span-2 text-center py-12 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
        <p class="text-gray-400">{{ $t("admin_settings.webhooks.empty") }}</p>
      </div>

      <div
        v-for="webhook in webhooks"
        :key="webhook.id"
        class="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between group hover:border-indigo-500/50 transition-colors">
        <div class="mb-4">
          <div class="flex items-start justify-between mb-2">
            <div
              class="flex items-center gap-2 text-indigo-400 font-mono text-sm break-all">
              <i class="fa-solid fa-globe"></i>
              {{ webhook.url }}
            </div>
            <button
              @click="deleteWebhook(webhook.id)"
              class="text-gray-500 hover:text-red-400 transition-colors">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          <div class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="event in webhook.events"
              :key="event"
              class="px-2 py-1 rounded bg-slate-700 text-xs text-gray-300 border border-slate-600">
              {{
                $t("admin_settings.webhooks.events." + event.replace(".", "_"))
              }}
            </span>
          </div>
        </div>

        <div
          class="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
          <span>
            {{ $t("admin_settings.webhooks.date_label") }}:
            {{ formatDate(webhook.createdAt) }}
          </span>
          <span
            v-if="webhook.secret"
            class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ $t("admin_settings.webhooks.secured") }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <BaseModal
      :show="showModal"
      :title="$t('admin_settings.webhooks.modal_title')"
      @close="showModal = false">
      <form @submit.prevent="createWebhook" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            {{ $t("admin_settings.webhooks.url_label") }}
          </label>
          <input
            v-model="form.url"
            type="url"
            required
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
            placeholder="https://api.example.com/webhook" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            {{ $t("admin_settings.webhooks.secret_label") }}
          </label>
          <input
            v-model="form.secret"
            type="text"
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
            :placeholder="$t('admin_settings.webhooks.secret_placeholder')" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            {{ $t("admin_settings.webhooks.events_label") }}
          </label>
          <div class="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            <label
              v-for="event in availableEvents"
              :key="event.value"
              class="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
              <input
                type="checkbox"
                :value="event.value"
                v-model="form.events"
                class="h-4 w-4 rounded border-gray-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm text-gray-300">{{ event.label }}</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            @click="showModal = false"
            class="px-4 py-2 text-gray-300 hover:text-white">
            {{ $t("common.cancel") }}
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
            {{ submitting ? $t("common.sending") : $t("common.create") }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
