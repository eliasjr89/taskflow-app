<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import type { Task, Project } from "@/types";
import BaseModal from "@/components/common/BaseModal.vue";
import Badge from "@/components/admin/Badge.vue";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import { useConfetti } from "@/composables/useConfetti";
import EnhancedSelect from "@/components/common/EnhancedSelect.vue";

const toast = useToast();
const { confirm } = useConfirm();
const { triggerConfetti } = useConfetti();

// Types
interface TaskStatus {
  id: number;
  name: string;
}

// State
const tasks = ref<Task[]>([]);
const projects = ref<Project[]>([]);
const statuses = ref<TaskStatus[]>([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);

const form = ref({
  id: null as number | null,
  description: "",
  project_id: null as number | null,
  status_id: null as number | null,
  priority: "low" as "low" | "medium" | "high",
  due_date: null as string | null,
});

// Fetch Data
const fetchData = async () => {
  loading.value = true;
  try {
    // Parallel fetching for performance
    const [tasksRes, projectsRes, statusesRes] = await Promise.all([
      api.get("/tasks"),
      api.get("/projects"),
      api.get("/task-statuses"),
    ]);

    tasks.value = tasksRes.data.data || tasksRes.data || [];
    projects.value = projectsRes.data.data || projectsRes.data || [];
    statuses.value = statusesRes.data.data || statusesRes.data || [];
  } catch {
    toast.error("Error", "No se pudieron cargar las tareas");
  } finally {
    loading.value = false;
  }
};

const fetchProjects = async () => {
  try {
    const res = await api.get("/projects");
    projects.value = res.data.data || res.data || [];
  } catch {
    // Silent error
  }
};

const fetchStatuses = async () => {
  try {
    const res = await api.get("/task-statuses");
    statuses.value = res.data.data || res.data || [];
  } catch {
    // Silent error
  }
};

// Actions
const openModal = async (task?: Task) => {
  // Ensure we have fresh data for dropdowns
  if (projects.value.length === 0) {
    await fetchProjects();
  }
  if (statuses.value.length === 0) {
    await fetchStatuses();
  }

  if (task) {
    form.value = {
      id: task.id,
      description: task.description,
      project_id: task.project_id,
      status_id: task.status_id,
      priority: task.priority,
      due_date: task.due_date || null,
    };
  } else {
    form.value = {
      id: null,
      description: "",
      project_id: null,
      status_id: statuses.value[0]?.id ?? 1, // Default status
      priority: "low",
      due_date: null,
    };
  }
  showModal.value = true;
};

const closeModal = async (force: boolean = false) => {
  if (!force && (form.value.description || form.value.project_id)) {
    const confirmed = await confirm({
      title: "¿Cerrar sin guardar?",
      message: "Los cambios no guardados se perderán.",
      confirmText: "Cerrar",
      cancelText: "Continuar editando",
      type: "warning",
    });

    if (!confirmed) return;
  }

  showModal.value = false;
  form.value = {
    id: null,
    description: "",
    project_id: null,
    status_id: null,
    priority: "low",
    due_date: null,
  };
};

const handleSubmit = async () => {
  if (
    !form.value.description ||
    !form.value.project_id ||
    !form.value.status_id
  )
    return;

  submitting.value = true;
  try {
    const payload: any = {
      description: form.value.description,
      project_id: form.value.project_id,
      status_id: form.value.status_id,
      priority: form.value.priority,
    };

    // Add due_date if it exists
    if (form.value.due_date) {
      payload.due_date = form.value.due_date;
    }

    if (form.value.id) {
      await api.put(`/tasks/${form.value.id}`, payload);
      toast.success(
        "Tarea actualizada",
        "La tarea se ha actualizado correctamente"
      );
    } else {
      await api.post("/tasks", payload);
      toast.success("Tarea creada", "La tarea se ha creado exitosamente");
    }
    await fetchData(); // Refresh list
    closeModal(true);
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || "Error al guardar la tarea";
    toast.error("Error", errorMsg);
  } finally {
    submitting.value = false;
  }
};

const deleteTask = async (id: number) => {
  const confirmed = await confirm({
    title: "¿Eliminar tarea?",
    message:
      "Esta acción no se puede deshacer. La tarea será eliminada permanentemente.",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete(`/tasks/${id}`);
    tasks.value = tasks.value.filter((t) => t.id !== id);
    toast.success("Tarea eliminada", "La tarea se ha eliminado correctamente");
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Error al eliminar la tarea";
    toast.error("Error", errorMsg);
  }
};

const completeTask = async (task: Task) => {
  const confirmed = await confirm({
    title: "¿Completar tarea?",
    message: `¿Marcar "${task.description}" como completada?`,
    confirmText: "Completar",
    cancelText: "Cancelar",
    type: "success",
  });

  if (!confirmed) return;

  try {
    // Find the "Completed" or "Done" status
    const completedStatus = statuses.value.find(
      (s) =>
        s.name.toLowerCase().includes("complet") ||
        s.name.toLowerCase().includes("done")
    );

    if (!completedStatus) {
      toast.error("Error", 'No se encontró el estado "Completado"');
      return;
    }

    await api.put(`/tasks/${task.id}`, {
      ...task,
      status_id: completedStatus.id,
      completed: true,
    });

    // Update local state
    const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
    const taskToUpdate = tasks.value[taskIndex];
    if (taskToUpdate) {
      taskToUpdate.status_id = completedStatus.id;
      taskToUpdate.status_name = completedStatus.name;
    }

    // Trigger confetti!
    triggerConfetti();

    toast.success("¡Tarea completada!", "¡Excelente trabajo! 🎉");
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Error al completar la tarea";
    toast.error("Error", errorMsg);
  }
};

const uncompleteTask = async (task: Task) => {
  const confirmed = await confirm({
    title: "¿Desmarcar tarea?",
    message: `¿Marcar "${task.description}" como pendiente nuevamente?`,
    confirmText: "Desmarcar",
    cancelText: "Cancelar",
    type: "warning",
  });

  if (!confirmed) return;

  try {
    // Find the "To Do" or "Pending" status
    const pendingStatus = statuses.value.find(
      (s) =>
        s.name.toLowerCase().includes("to do") ||
        s.name.toLowerCase().includes("pendiente") ||
        s.name.toLowerCase().includes("pending")
    );

    if (!pendingStatus) {
      toast.error("Error", 'No se encontró el estado "Pendiente"');
      return;
    }

    await api.put(`/tasks/${task.id}`, {
      ...task,
      status_id: pendingStatus.id,
      completed: false,
    });

    // Update local state
    const taskIndex = tasks.value.findIndex((t) => t.id === task.id);
    const taskToUpdate = tasks.value[taskIndex];
    if (taskToUpdate) {
      taskToUpdate.status_id = pendingStatus.id;
      taskToUpdate.status_name = pendingStatus.name;
    }

    toast.success("Tarea desmarcada", "La tarea volvió a estado pendiente");
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Error al desmarcar la tarea";
    toast.error("Error", errorMsg);
  }
};

// Helper function to check if task is completed
const isTaskCompleted = (task: Task): boolean => {
  const statusName = task.status_name?.toLowerCase() || "";
  return statusName.includes("complet") || statusName.includes("done");
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Sin fecha";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(fetchData);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">Tareas</h2>
        <p class="text-text-muted">Seguimiento de tareas y prioridades.</p>
      </div>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>Nueva Tarea</span>
      </button>
    </div>

    <!-- Modern Skeleton Loader -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 6"
        :key="i"
        class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-pulse">
        <div class="flex justify-between mb-4">
          <div class="h-4 bg-slate-700 rounded w-20"></div>
          <div class="h-4 bg-slate-700 rounded w-4"></div>
        </div>
        <div class="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div class="flex gap-2 mb-4">
          <div class="h-6 bg-slate-700 rounded w-20"></div>
          <div class="h-6 bg-slate-700 rounded w-20"></div>
        </div>
        <div
          class="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
          <div class="h-8 bg-slate-700 rounded w-20"></div>
          <div class="flex gap-2">
            <div class="w-8 h-8 bg-slate-700 rounded"></div>
            <div class="w-8 h-8 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="tasks.length === 0"
      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-12 text-center">
      <div class="inline-flex p-4 rounded-full bg-white/5 mb-4">
        <i class="fa-solid fa-clipboard-check text-4xl text-text-muted"></i>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Todo listo por ahora</h3>
      <p class="text-text-muted mb-6">
        No hay tareas pendientes en el sistema.
      </p>
      <button
        @click="openModal()"
        class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm inline-flex items-center gap-2">
        Crear primera tarea
      </button>
    </div>

    <!-- Task Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 relative overflow-hidden">
        <!-- Status Stripe -->
        <div
          :class="[
            'absolute top-0 left-0 w-1 h-full transition-colors',
            isTaskCompleted(task) ? 'bg-emerald-500' : 'bg-blue-500',
          ]"></div>

        <!-- Header -->
        <div class="flex items-start justify-between mb-3 pl-3">
          <Badge type="priority" :value="task.priority" />
          <div
            class="flex gap-2 opactiy-0 group-hover:opacity-100 transition-opacity">
            <button
              v-if="!isTaskCompleted(task)"
              @click="completeTask(task)"
              class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center"
              title="Completar">
              <i class="fa-solid fa-check text-sm"></i>
            </button>
            <button
              v-else
              @click="uncompleteTask(task)"
              class="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all flex items-center justify-center"
              title="Desmarcar">
              <i class="fa-solid fa-rotate-left text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="pl-3 mb-4">
          <h3
            :class="[
              'text-lg font-bold text-white mb-2 transition-all',
              isTaskCompleted(task) ? 'line-through opacity-60' : '',
            ]">
            {{ task.description }}
          </h3>

          <div class="flex flex-wrap gap-2 mb-3">
            <Badge
              type="status"
              :value="task.status || task.status_name || 'Unknown'" />
            <span
              class="text-xs px-2 py-1 rounded-md bg-slate-700 text-text-muted flex items-center gap-1">
              <i class="fa-solid fa-folder text-[10px]"></i>
              {{ task.project_name || "Sin proyecto" }}
            </span>
            <span
              v-if="task.due_date"
              class="text-xs px-2 py-1 rounded-md bg-slate-700 text-text-muted flex items-center gap-1">
              <i class="fa-solid fa-calendar text-[10px]"></i>
              {{ formatDate(task.due_date) }}
            </span>
          </div>

          <!-- Tags -->
          <div
            v-if="task.tags && task.tags.length > 0"
            class="flex flex-wrap gap-1">
            <span
              v-for="tag in task.tags"
              :key="tag.id"
              class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
              #{{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Footer Actions (Edit/Delete) -->
        <div
          class="flex justify-end gap-2 pt-4 border-t border-slate-700/50 pl-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          <button
            @click="openModal(task)"
            class="text-xs font-medium text-text-muted hover:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          <button
            @click="deleteTask(task.id)"
            class="text-xs font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <BaseModal
      :show="showModal"
      :title="form.id ? 'Editar Tarea' : 'Nueva Tarea'"
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Description -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            Descripción
            <span class="text-red-400 ml-1">*</span>
          </label>
          <div class="relative group">
            <div class="absolute left-4 top-4 pointer-events-none">
              <i
                class="fa-solid fa-align-left text-gray-400 transition-colors group-focus-within:text-primary"></i>
            </div>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none hover:border-slate-600"
              required
              placeholder="Describe la tarea a realizar..."></textarea>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Project Select -->
          <EnhancedSelect
            v-model="form.project_id"
            :options="projects.map((p) => ({ value: p.id, label: p.name }))"
            label="Proyecto"
            placeholder="Selecciona un proyecto..."
            icon="fa-briefcase"
            :required="true" />

          <!-- Status Select -->
          <EnhancedSelect
            v-model="form.status_id"
            :options="statuses.map((s) => ({ value: s.id, label: s.name }))"
            label="Estado"
            placeholder="Selecciona un estado..."
            icon="fa-spinner"
            :required="true" />
        </div>

        <!-- Priority Select -->
        <EnhancedSelect
          v-model="form.priority"
          :options="[
            {
              value: 'low',
              label: 'Baja',
              icon: 'fa-arrow-down',
              color: 'text-green-400',
            },
            {
              value: 'medium',
              label: 'Media',
              icon: 'fa-minus',
              color: 'text-yellow-400',
            },
            {
              value: 'high',
              label: 'Alta',
              icon: 'fa-arrow-up',
              color: 'text-orange-400',
            },
            {
              value: 'urgent',
              label: 'Urgente',
              icon: 'fa-fire',
              color: 'text-red-400',
            },
          ]"
          label="Prioridad"
          placeholder="Selecciona prioridad..."
          icon="fa-layer-group" />

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-6 border-t border-slate-700/50">
          <button
            type="button"
            @click="() => closeModal(false)"
            class="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-white hover:bg-slate-700/50 transition-all duration-200 font-medium flex items-center justify-center gap-2 group">
            <i
              class="fa-solid fa-xmark group-hover:rotate-90 transition-transform duration-200"></i>
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2">
            <i
              v-if="!submitting"
              :class="['fa-solid', form.id ? 'fa-save' : 'fa-plus']"></i>
            <i v-else class="fa-solid fa-spinner fa-spin"></i>
            {{
              submitting
                ? "Guardando..."
                : form.id
                ? "Guardar Cambios"
                : "Crear Tarea"
            }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
