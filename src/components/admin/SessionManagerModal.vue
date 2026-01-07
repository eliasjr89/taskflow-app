<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseModal from "@/components/common/BaseModal.vue";
import adminService from "@/services/adminService";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  user: any;
  show: boolean;
}>();

defineEmits(["close"]);

const sessions = ref<any[]>([]);
const loading = ref(true);
const toast = useToast();
const { confirm } = useConfirm();
const { locale } = useI18n();

const fetchSessions = async () => {
  loading.value = true;
  try {
    const res = await adminService.getUserSessions(props.user.id);
    sessions.value = res.data.data;
  } catch {
    toast.error("Error", "No se pudieron cargar las sesiones");
  } finally {
    loading.value = false;
  }
};

const killSession = async (sessionId: string) => {
  const confirmed = await confirm({
    title: "Cerrar Sesión",
    message: "¿Estás seguro de que deseas desconectar este dispositivo?",
    type: "danger",
    confirmText: "Desconectar",
  });

  if (!confirmed) return;

  try {
    await adminService.deleteSession(sessionId);
    sessions.value = sessions.value.filter((s) => s.sessionId !== sessionId);
    toast.success("Éxito", "Sesión cerrada correctamente");
  } catch {
    toast.error("Error", "No se pudo cerrar la sesión");
  }
};

onMounted(() => {
  if (props.show) fetchSessions();
});

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
  <BaseModal
    :show="show"
    :title="`Sesiones Activas: ${user.username}`"
    @close="$emit('close')">
    <div class="space-y-4">
      <div v-if="loading" class="animate-pulse space-y-3">
        <div class="h-12 bg-slate-700 rounded-lg"></div>
        <div class="h-12 bg-slate-700 rounded-lg"></div>
      </div>

      <div
        v-else-if="sessions.length === 0"
        class="text-center py-8 text-text-muted">
        <i class="fa-solid fa-laptop-slash text-2xl mb-2"></i>
        <p>No hay sesiones activas para este usuario.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.sessionId"
          class="bg-slate-700/30 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white">
              <i class="fa-solid fa-desktop"></i>
            </div>
            <div>
              <p class="font-bold text-white text-sm">
                {{ session.ipAddress || "Unknown IP" }}
              </p>
              <p
                class="text-xs text-text-muted truncate max-w-[200px]"
                :title="session.userAgent">
                {{ session.userAgent }}
              </p>
              <p class="text-[10px] text-indigo-400 mt-1">
                Activo
                {{ getRelativeTime(session.lastActiveAt) }}
              </p>
            </div>
          </div>
          <button
            @click="killSession(session.sessionId)"
            class="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            title="Cerrar Sesión">
            <i class="fa-solid fa-power-off"></i>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
