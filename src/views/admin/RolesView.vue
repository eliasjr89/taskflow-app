<script setup lang="ts">
import { ref, onMounted } from "vue";
import adminService from "@/services/adminService";
import RoleModal from "@/components/admin/RoleModal.vue";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useI18n } from "vue-i18n";

const roles = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const selectedRole = ref<any>(null);

const toast = useToast();
const { confirm } = useConfirm();
const { t } = useI18n();

const fetchRoles = async () => {
  loading.value = true;
  try {
    const res = await adminService.getRoles();
    roles.value = res.data.data;
  } catch {
    toast.error(t("common.error_title"), t("admin_roles.load_error"));
  } finally {
    loading.value = false;
  }
};

const openModal = (role?: any) => {
  selectedRole.value = role;
  showModal.value = true;
};

const deleteRole = async (role: any) => {
  if (role.isSystem) return;

  const confirmed = await confirm({
    title: t("admin_roles.delete_title"),
    message: t("admin_roles.delete_confirm", { role: role.name }),
    type: "danger",
    confirmText: t("common.delete"),
  });

  if (!confirmed) return;

  try {
    await adminService.deleteRole(role.id);
    roles.value = roles.value.filter((r) => r.id !== role.id);
    toast.success(
      t("admin_roles.delete_success"),
      t("admin_roles.delete_success_msg")
    );
  } catch (err: any) {
    toast.error(
      t("common.error_title"),
      err.response?.data?.message || t("admin_roles.delete_error")
    );
  }
};

onMounted(fetchRoles);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">
          {{ $t("admin_roles.title") }}
        </h2>
        <p class="text-text-muted">
          {{ $t("admin_roles.subtitle") }}
        </p>
      </div>
      <button
        @click="openModal()"
        class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>{{ $t("admin_roles.new_role") }}</span>
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 3"
        :key="i"
        class="h-40 bg-slate-800 rounded-2xl animate-pulse"></div>
    </div>

    <!-- Roles Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="role in roles"
        :key="role.id"
        class="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between group hover:border-indigo-500/50 transition-colors">
        <div>
          <div class="flex justify-between items-start mb-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
              :class="
                role.isSystem
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-indigo-500/20 text-indigo-400'
              ">
              <i
                class="fa-solid"
                :class="role.isSystem ? 'fa-shield-halved' : 'fa-user-tag'"></i>
            </div>

            <div
              v-if="role.isSystem"
              class="px-2 py-1 rounded bg-white/5 text-[10px] uppercase font-bold text-text-muted border border-white/5">
              {{ $t("admin_roles.system_role") }}
            </div>
          </div>

          <h3 class="text-xl font-bold text-white mb-1">{{ role.name }}</h3>
          <p class="text-sm text-text-muted mb-4 line-clamp-2">
            {{ role.description || $t("common.no_description") }}
          </p>

          <div class="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <i class="fa-solid fa-users"></i>
            <span>{{
              $t("admin_roles.assigned_users", { n: role._count?.users || 0 })
            }}</span>
          </div>

          <div class="space-y-2">
            <div
              class="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {{ $t("admin_roles.featured_permissions") }}
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="perm in (role.permissions || []).slice(0, 4)"
                :key="perm.id"
                class="px-2 py-0.5 rounded bg-slate-700 text-xs text-indigo-300 border border-slate-600">
                {{ perm.permission.action }} {{ perm.permission.resource }}
              </span>
              <span
                v-if="(role.permissions?.length || 0) > 4"
                class="px-2 py-0.5 rounded bg-slate-700 text-xs text-gray-400 border border-slate-600">
                +{{ role.permissions.length - 4 }}
              </span>
              <span
                v-if="!role.permissions || role.permissions.length === 0"
                class="text-xs text-gray-500 italic">
                {{ $t("admin_roles.no_permissions") }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-6 pt-4 border-t border-white/5">
          <button
            @click="openModal(role)"
            class="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">
            {{ $t("common.edit") }}
          </button>
          <button
            v-if="!role.isSystem"
            @click="deleteRole(role)"
            class="py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <RoleModal
      :show="showModal"
      :role-data="selectedRole"
      @close="showModal = false"
      @saved="fetchRoles" />
  </div>
</template>
