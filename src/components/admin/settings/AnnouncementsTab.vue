<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import adminService from "@/services/adminService";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";
import { useConfirm } from "@/composables/useConfirm";

const announcements = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);
const toast = useToast();
const { confirm } = useConfirm();
const { t, locale } = useI18n();

const form = ref({
  title: "",
  message: "",
  type: "info",
});

const types = computed(() => [
  {
    value: "info",
    label: t("admin_settings.announcements.types.info"),
    class: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    value: "success",
    label: t("admin_settings.announcements.types.success"),
    class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    value: "warning",
    label: t("admin_settings.announcements.types.warning"),
    class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    value: "error",
    label: t("admin_settings.announcements.types.error"),
    class: "bg-red-500/10 text-red-400 border-red-500/20",
  },
]);

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const res = await adminService.getAnnouncements();
    announcements.value = res.data.data;
  } catch {
    toast.error(
      t("common.error"),
      t("admin_settings.announcements.errors.load")
    );
  } finally {
    loading.value = false;
  }
};

const createAnnouncement = async () => {
  submitting.value = true;
  try {
    await adminService.createAnnouncement(form.value);
    toast.success(
      t("admin_settings.announcements.create_title"),
      t("admin_settings.announcements.create_success")
    );
    showModal.value = false;
    form.value = { title: "", message: "", type: "info" };
    fetchAnnouncements();
  } catch {
    toast.error(
      t("common.error"),
      t("admin_settings.announcements.errors.create")
    );
  } finally {
    submitting.value = false;
  }
};

const deleteAnnouncement = async (id: number) => {
  const confirmed = await confirm({
    title: t("admin_settings.announcements.delete_title"),
    message: t("admin_settings.announcements.delete_confirm"),
    type: "warning",
  });
  if (!confirmed) return;

  try {
    await adminService.deleteAnnouncement(id);
    toast.success(
      t("common.success"),
      t("admin_settings.announcements.delete_success")
    );
    fetchAnnouncements();
  } catch {
    toast.error(
      t("common.error"),
      t("admin_settings.announcements.errors.delete")
    );
  }
};

onMounted(fetchAnnouncements);

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
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <button
        @click="showModal = true"
        class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
        <i class="fa-solid fa-bullhorn"></i>
        {{ $t("admin_settings.announcements.new_announcement") }}
      </button>
    </div>

    <!-- List -->
    <div class="space-y-4">
      <div
        v-if="loading && announcements.length === 0"
        class="text-center py-8 text-gray-500">
        {{ $t("admin_settings.announcements.loading") }}
      </div>
      <div
        v-else-if="announcements.length === 0"
        class="text-center py-8 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
        <p class="text-gray-400">
          {{ $t("admin_settings.announcements.empty") }}
        </p>
      </div>

      <div
        v-for="announcement in announcements"
        :key="announcement.id"
        class="bg-slate-800 border border-slate-700 rounded-xl p-6 relative group overflow-hidden">
        <div class="flex items-start justify-between relative z-10">
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
              :class="{
                'bg-blue-500/20 text-blue-400': announcement.type === 'info',
                'bg-emerald-500/20 text-emerald-400':
                  announcement.type === 'success',
                'bg-amber-500/20 text-amber-400':
                  announcement.type === 'warning',
                'bg-red-500/20 text-red-400': announcement.type === 'error',
              }">
              <i
                class="fa-solid"
                :class="{
                  'fa-circle-info': announcement.type === 'info',
                  'fa-check-circle': announcement.type === 'success',
                  'fa-triangle-exclamation': announcement.type === 'warning',
                  'fa-circle-xmark': announcement.type === 'error',
                }"></i>
            </div>

            <div>
              <h4 class="font-bold text-white text-lg">
                {{ announcement.title }}
              </h4>
              <p class="text-gray-300 mt-1">{{ announcement.message }}</p>
              <div class="mt-3 flex items-center gap-4 text-xs text-text-muted">
                <span>
                  {{
                    $t("admin_settings.announcements.published_at", {
                      time: getRelativeTime(announcement.createdAt),
                    })
                  }}
                </span>
                <span
                  v-if="announcement.creator"
                  class="flex items-center gap-1">
                  <i class="fa-solid fa-user"></i>
                  {{ announcement.creator.username }}
                </span>
              </div>
            </div>
          </div>

          <button
            @click="deleteAnnouncement(announcement.id)"
            class="text-gray-500 hover:text-red-400 transition-colors p-2"
            :title="$t('common.delete')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <BaseModal
      :show="showModal"
      :title="$t('admin_settings.announcements.modal_title')"
      @close="showModal = false">
      <form @submit.prevent="createAnnouncement" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            {{ $t("admin_settings.announcements.form_title") }}
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
            :placeholder="
              $t('admin_settings.announcements.form_title_placeholder')
            " />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            {{ $t("admin_settings.announcements.form_type") }}
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="t in types"
              :key="t.value"
              type="button"
              @click="form.type = t.value"
              class="px-4 py-2 rounded-lg text-sm font-bold border transition-all"
              :class="
                form.type === t.value
                  ? t.class +
                    ' ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-500'
                  : 'bg-slate-700 border-transparent text-gray-400 hover:bg-slate-600'
              ">
              {{ t.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            {{ $t("admin_settings.announcements.form_message") }}
          </label>
          <textarea
            v-model="form.message"
            required
            rows="3"
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500 block h-24"
            :placeholder="
              $t('admin_settings.announcements.form_message_placeholder')
            "></textarea>
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
            {{
              submitting
                ? $t("admin_settings.announcements.publishing_btn")
                : $t("admin_settings.announcements.publish_btn")
            }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
