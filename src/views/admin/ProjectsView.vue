<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import type { Project } from "@/types";
import BaseModal from "@/components/common/BaseModal.vue";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";

const toast = useToast();
const { confirm } = useConfirm();

const projects = ref<Project[]>([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);

const form = ref({
  id: null as number | null,
  name: "",
  description: "",
});

const fetchProjects = async () => {
  loading.value = true;
  try {
    const res = await api.get("/projects");
    projects.value = res.data.data;
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
};

const openModal = (project?: Project) => {
  if (project) {
    form.value = {
      id: project.id,
      name: project.name,
      description: project.description || "",
    };
  } else {
    form.value = { id: null, name: "", description: "" };
  }
  showModal.value = true;
};

const closeModal = async (force: boolean = false) => {
  if (!force && (form.value.name || form.value.description)) {
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
  form.value = { id: null, name: "", description: "" };
};

const handleSubmit = async () => {
  if (!form.value.name) return;
  submitting.value = true;
  try {
    if (form.value.id) {
      await api.put(`/projects/${form.value.id}`, form.value);
      toast.success(
        "Proyecto actualizado",
        "El proyecto se ha actualizado correctamente"
      );
    } else {
      await api.post("/projects", form.value);
      toast.success("Proyecto creado", "El proyecto se ha creado exitosamente");
    }
    await fetchProjects();
    closeModal(true);
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Error al guardar el proyecto";
    toast.error("Error", errorMsg);
  } finally {
    submitting.value = false;
  }
};

const deleteProject = async (id: number) => {
  const confirmed = await confirm({
    title: "¿Eliminar proyecto?",
    message:
      "Esta acción no se puede deshacer. Las tareas asociadas podrían verse afectadas.",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete(`/projects/${id}`);
    projects.value = projects.value.filter((p) => p.id !== id);
    toast.success(
      "Proyecto eliminado",
      "El proyecto se ha eliminado correctamente"
    );
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Error al eliminar el proyecto";
    toast.error("Error", errorMsg);
  }
};

const formatDate = (dateString?: string) => {
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

onMounted(fetchProjects);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">Proyectos</h2>
        <p class="text-text-muted">
          Gestiona los proyectos y asignaciones del equipo.
        </p>
      </div>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>Nuevo Proyecto</span>
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
        <div class="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div class="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
        <div class="flex gap-4 mt-6">
          <div class="h-10 bg-slate-700 rounded flex-1"></div>
          <div class="h-10 bg-slate-700 rounded w-10"></div>
        </div>
      </div>
    </div>

    <!-- Project Cards Grid -->
    <div
      v-else-if="projects.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3
              class="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
              {{ project.name }}
            </h3>
            <p class="text-xs text-text-muted">ID: #{{ project.id }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="openModal(project)"
              class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              title="Editar">
              <i class="fa-solid fa-pen text-sm"></i>
            </button>
            <button
              @click="deleteProject(project.id)"
              class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
              title="Eliminar">
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Description -->
        <p class="text-gray-300 text-sm mb-4 line-clamp-2 min-h-10">
          {{ project.description || "Sin descripción" }}
        </p>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div
            class="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div class="flex items-center gap-2 mb-1">
              <i class="fa-solid fa-list-check text-blue-400 text-xs"></i>
              <span class="text-xs text-text-muted">Tareas</span>
            </div>
            <div class="text-xl font-bold text-white">
              {{ project.task_count || 0 }}
            </div>
          </div>
          <div
            class="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div class="flex items-center gap-2 mb-1">
              <i class="fa-solid fa-users text-purple-400 text-xs"></i>
              <span class="text-xs text-text-muted">Equipo</span>
            </div>
            <div class="text-xl font-bold text-white">
              {{ project.member_count || 0 }}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {{ project.creator_username?.charAt(0).toUpperCase() || "?" }}
            </div>
            <div>
              <div class="text-xs text-white font-medium">
                {{ project.creator_username || "Sin asignar" }}
              </div>
              <div class="text-[10px] text-text-muted">Creador</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-text-muted">
              <i class="fa-solid fa-calendar text-[10px] mr-1"></i>
              {{ formatDate(project.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-12 text-center">
      <div class="inline-flex p-4 rounded-full bg-white/5 mb-4">
        <i class="fa-solid fa-briefcase text-4xl text-text-muted"></i>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">No hay proyectos</h3>
      <p class="text-text-muted mb-6">
        Comienza creando tu primer proyecto para organizar el trabajo.
      </p>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
        <i class="fa-solid fa-plus mr-2"></i>
        Crear Primer Proyecto
      </button>
    </div>
    <!-- Modal Form -->
    <BaseModal
      :show="showModal"
      :title="form.id ? 'Editar Proyecto' : 'Nuevo Proyecto'"
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Project Name -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            Nombre del Proyecto
            <span class="text-red-400 ml-1">*</span>
          </label>
          <div class="relative group">
            <div
              class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <i
                class="fa-solid fa-folder text-gray-400 transition-colors group-focus-within:text-primary"></i>
            </div>
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-11 pr-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              required
              placeholder="Ej: Rediseño Web" />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            Descripción
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
              placeholder="Breve descripción del proyecto..."></textarea>
          </div>
        </div>

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
                : "Crear Proyecto"
            }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
