<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import adminService from "@/services/adminService";
import { useToast } from "@/composables/useToast";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  show: boolean;
  roleData?: any;
}>();

const emit = defineEmits(["close", "saved"]);

const { t } = useI18n();
const toast = useToast();

const submitting = ref(false);
const permissions = ref<any[]>([]);

const form = ref({
  id: null as number | null,
  name: "",
  description: "",
  permissionIds: [] as number[],
});

// Group permissions by resource for UI
const groupedPermissions = computed(() => {
  const groups: Record<string, any[]> = {};
  permissions.value.forEach((p) => {
    if (!groups[p.resource]) groups[p.resource] = [];
    groups[p.resource].push(p);
  });
  return groups;
});

const fetchPermissions = async () => {
  try {
    const res = await adminService.getPermissions();
    permissions.value = res.data.data;
  } catch {
    toast.error(t("common.error_title"), t("admin_roles.load_error"));
  }
};

watch(
  () => props.show,
  (val) => {
    if (val) {
      if (permissions.value.length === 0) fetchPermissions();
      if (props.roleData) {
        form.value = {
          id: props.roleData.id,
          name: props.roleData.name,
          description: props.roleData.description || "",
          permissionIds:
            props.roleData.permissions?.map((p: any) => p.permissionId) || [],
        };
      } else {
        form.value = {
          id: null,
          name: "",
          description: "",
          permissionIds: [],
        };
      }
    }
  }
);

const handleSubmit = async () => {
  if (!form.value.name) return;
  submitting.value = true;
  try {
    if (form.value.id) {
      await adminService.updateRole(form.value.id, form.value);
      toast.success(
        t("admin_users.update_success"),
        t("admin_users.update_msg")
      );
    } else {
      await adminService.createRole(form.value);
      toast.success(
        t("admin_roles.create_success"),
        t("admin_roles.create_msg")
      );
    }
    emit("saved");
    emit("close");
  } catch (err: any) {
    toast.error(
      t("common.error_title"),
      err.response?.data?.message || t("admin_roles.save_error")
    );
  } finally {
    submitting.value = false;
  }
};

const toggleGroup = (resource: string, checked: boolean) => {
  const group = groupedPermissions.value[resource];
  if (!group) return;
  const ids = group.map((p: any) => p.id);
  if (checked) {
    // Add all unique
    const newIds = new Set([...form.value.permissionIds, ...ids]);
    form.value.permissionIds = Array.from(newIds) as number[];
  } else {
    // Remove all
    form.value.permissionIds = form.value.permissionIds.filter(
      (id) => !ids.includes(id)
    );
  }
};
</script>

<template>
  <BaseModal
    :show="show"
    :title="form.id ? t('admin_roles.edit_role') : t('admin_roles.new_role')"
    @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Info -->
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">{{
            t("admin_roles.role_name")
          }}</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
            :placeholder="t('admin_roles.name_placeholder')" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">{{
            t("admin_roles.description")
          }}</label>
          <input
            v-model="form.description"
            type="text"
            class="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
            :placeholder="t('admin_roles.description_placeholder')" />
        </div>
      </div>

      <!-- Permissions Matrix -->
      <div class="space-y-4">
        <h4
          class="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
          {{ t("admin_roles.permissions") }}
        </h4>

        <div
          v-if="permissions.length === 0"
          class="text-text-muted text-center py-4">
          {{ t("common.loading") }}
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
          <div
            v-for="(perms, resource) in groupedPermissions"
            :key="resource"
            class="bg-slate-700/30 p-4 rounded-xl border border-white/5">
            <div class="flex items-center justify-between mb-3">
              <span class="font-bold text-white capitalize">{{
                resource
              }}</span>
              <!-- Select All for Group -->
              <label
                class="flex items-center gap-2 text-xs text-indigo-400 cursor-pointer select-none hover:text-indigo-300">
                <input
                  type="checkbox"
                  @change="(e) => toggleGroup(resource as string, (e.target as HTMLInputElement).checked)"
                  class="rounded bg-slate-600 border-slate-500 text-indigo-600 focus:ring-offset-slate-800" />
                {{ t("common.all") }}
              </label>
            </div>

            <div class="space-y-2">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-1 rounded transition-colors">
                <div class="relative flex items-center">
                  <input
                    type="checkbox"
                    :value="perm.id"
                    v-model="form.permissionIds"
                    class="peer h-4 w-4 rounded border-gray-500 bg-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800 transition-all" />
                </div>
                <span
                  class="text-sm text-gray-300 group-hover:text-white transition-colors capitalize">
                  {{ perm.action }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors">
          {{ t("common.cancel") }}
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
          <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
          {{
            submitting ? t("common.saving", "Guardando...") : t("common.save")
          }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
