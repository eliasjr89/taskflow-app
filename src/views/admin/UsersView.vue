<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import type { User } from "@/types";
import Modal from "@/components/admin/Modal.vue";
import { useToast } from "@/composables/useToast";
import { useConfirm } from "@/composables/useConfirm";
import EnhancedSelect from "@/components/EnhancedSelect.vue";

const toast = useToast();
const { confirm } = useConfirm();

const users = ref<User[]>([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);
const imageFile = ref<File | null>(null);
const imagePreview = ref<string>("");

const form = ref({
  id: null as number | null,
  username: "",
  email: "",
  name: "",
  lastname: "",
  role: "user" as "user" | "manager" | "admin",
  password: "",
  profile_image: "",
});

const roles = [
  { value: "user", label: "Usuario", icon: "fa-user" },
  { value: "manager", label: "Manager", icon: "fa-user-tie" },
  { value: "admin", label: "Administrador", icon: "fa-user-shield" },
];

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get("/users");
    users.value = res.data.data;
  } catch {
    toast.error("Error", "No se pudieron cargar los usuarios");
  } finally {
    loading.value = false;
  }
};

const openModal = (user?: User) => {
  if (user) {
    form.value = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
      role: user.role as "user" | "manager" | "admin",
      password: "",
      profile_image: user.profile_image || "",
    };
    imagePreview.value = user.profile_image || "";
  } else {
    form.value = {
      id: null,
      username: "",
      email: "",
      name: "",
      lastname: "",
      role: "user",
      password: "",
      profile_image: "",
    };
    imagePreview.value = "";
  }
  imageFile.value = null;
  showModal.value = true;
};

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Error", "La imagen no debe superar los 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Error", "Solo se permiten archivos de imagen");
      return;
    }

    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const closeModal = async (force: boolean = false) => {
  if (typeof force !== "boolean") force = false; // Fix for template event args

  if (!force && (form.value.username || form.value.email)) {
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
    username: "",
    email: "",
    name: "",
    lastname: "",
    role: "user",
    password: "",
    profile_image: "",
  };
  imageFile.value = null;
  imagePreview.value = "";
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("username", form.value.username);
    formData.append("email", form.value.email);
    formData.append("name", form.value.name);
    formData.append("lastname", form.value.lastname);
    formData.append("role", form.value.role);

    if (form.value.password) {
      formData.append("password", form.value.password);
    }

    if (imageFile.value) {
      formData.append("profile_image", imageFile.value);
    }

    if (form.value.id) {
      await api.put(`/users/${form.value.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        "Usuario actualizado",
        "Los cambios se guardaron correctamente"
      );
    } else {
      await api.post("/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Usuario creado", "El usuario se creó correctamente");
    }

    await fetchUsers();
    closeModal(true);
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Error al guardar el usuario";
    toast.error("Error", errorMsg);
  } finally {
    submitting.value = false;
  }
};

const deleteUser = async (id: number) => {
  const confirmed = await confirm({
    title: "¿Eliminar usuario?",
    message:
      "Esta acción no se puede deshacer. El usuario será eliminado permanentemente.",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    await api.delete(`/users/${id}`);
    users.value = users.value.filter((u) => u.id !== id);
    toast.success("Usuario eliminado", "El usuario se eliminó correctamente");
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Error al eliminar el usuario";
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

onMounted(fetchUsers);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-white">Gestión de Usuarios</h2>
        <p class="text-text-muted">
          Administra los accesos y roles de la plataforma.
        </p>
      </div>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2">
        <i class="fa-solid fa-plus"></i>
        <span>Nuevo Usuario</span>
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
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-slate-700 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-slate-700 rounded w-1/3"></div>
          </div>
        </div>
        <div class="h-4 bg-slate-700 rounded w-full mb-4"></div>
        <div class="flex justify-between items-center mt-4">
          <div class="h-6 bg-slate-700 rounded w-20"></div>
          <div class="flex gap-2">
            <div class="w-8 h-8 bg-slate-700 rounded"></div>
            <div class="w-8 h-8 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Cards Grid -->
    <div
      v-else-if="users.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="user in users"
        :key="user.id"
        class="group bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
        <!-- Header with Avatar -->
        <div class="flex items-center gap-4 mb-4">
          <img
            v-if="user.profile_image"
            :src="user.profile_image"
            alt="Avatar"
            class="w-14 h-14 rounded-full object-cover border-2 border-slate-600 group-hover:border-indigo-500 transition-colors" />
          <div
            v-else
            class="w-14 h-14 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-600 group-hover:border-indigo-500 transition-colors shadow-lg">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
              {{ user.name }} {{ user.lastname }}
            </h3>
            <p class="text-xs text-text-muted truncate">@{{ user.username }}</p>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-envelope text-indigo-400 w-5 text-center"></i>
            <span class="truncate">{{ user.email }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-300">
            <i class="fa-solid fa-calendar text-indigo-400 w-5 text-center"></i>
            <span>Unido {{ formatDate(user.created_at) }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <span
            :class="`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
              user.role === 'admin'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : user.role === 'manager'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`">
            <i
              :class="
                user.role === 'admin'
                  ? 'fa-solid fa-shield-halved'
                  : user.role === 'manager'
                  ? 'fa-solid fa-user-tie'
                  : 'fa-solid fa-user'
              "></i>
            {{ user.role }}
          </span>

          <div class="flex gap-2">
            <button
              @click="openModal(user)"
              class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center justify-center hover:scale-110"
              title="Editar">
              <i class="fa-solid fa-pen text-sm"></i>
            </button>
            <button
              @click="deleteUser(user.id)"
              class="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center hover:scale-110"
              title="Eliminar">
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-12 text-center">
      <div class="inline-flex p-4 rounded-full bg-white/5 mb-4">
        <i class="fa-solid fa-users text-4xl text-text-muted"></i>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">No hay usuarios</h3>
      <p class="text-text-muted mb-6">
        Invita a nuevos miembros al equipo para comenzar a colaborar.
      </p>
      <button
        @click="openModal()"
        class="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5">
        <i class="fa-solid fa-plus mr-2"></i>
        Crear Primer Usuario
      </button>
    </div>

    <!-- User Modal -->
    <Modal
      :show="showModal"
      :title="form.id ? 'Editar Usuario' : 'Nuevo Usuario'"
      @close="closeModal">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Profile Image Upload -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">
            Foto de Perfil
          </label>
          <div class="flex items-center gap-4">
            <div class="relative">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Preview"
                class="w-20 h-20 rounded-full object-cover border-2 border-primary" />
              <div
                v-else
                class="w-20 h-20 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-2xl">
                {{ form.username?.charAt(0).toUpperCase() || "?" }}
              </div>
              <label
                class="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors shadow-lg">
                <i class="fa-solid fa-camera text-white text-xs"></i>
                <input
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  class="hidden" />
              </label>
            </div>
            <div class="text-sm text-gray-400">
              <p>Tamaño máximo: 5MB</p>
              <p>Formatos: JPG, PNG, GIF</p>
            </div>
          </div>
        </div>

        <!-- Username and Email -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Usuario <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.username"
              type="text"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              placeholder="usuario123" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Email <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              placeholder="usuario@ejemplo.com" />
          </div>
        </div>

        <!-- Name and Lastname -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Nombre <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              placeholder="Juan" />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Apellidos <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.lastname"
              type="text"
              required
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              placeholder="Pérez" />
          </div>
        </div>

        <!-- Role and Password -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnhancedSelect
            v-model="form.role"
            label="Rol"
            icon="fa-user-shield"
            :options="roles"
            :required="true"
            placeholder="Selecciona un rol" />

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">
              Contraseña {{ form.id ? "" : "*" }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!form.id"
              class="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:border-slate-600"
              :placeholder="
                form.id ? 'Dejar en blanco para no cambiar' : '••••••••'
              " />
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
                : "Crear Usuario"
            }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>
