<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import { useToast } from "@/composables/useToast";
import { useSectionTheme } from "@/composables/useSectionTheme";
import { useUserState } from "@/composables/useUserState";

const toast = useToast();
const { theme } = useSectionTheme();
const { user, fetchUser } = useUserState();

const profileImage = ref<string | null>(null);
const loading = ref(true);
const saving = ref(false);

const fileInput = ref<HTMLInputElement | null>(null);
const avatarFile = ref<File | null>(null);

const form = ref({
  username: "",
  email: "",
  name: "",
  lastname: "",
  password: "",
  avatarColor: "",
});

const loadProfile = async () => {
  loading.value = true;
  try {
    if (!user.value) {
      await fetchUser();
    }

    if (user.value) {
      form.value = {
        username: user.value.username,
        email: user.value.email,
        name: user.value.name,
        lastname: user.value.lastname,
        password: "",
        avatarColor: "",
      };
      profileImage.value = user.value.profile_image || null;
    }
  } finally {
    loading.value = false;
  }
};

const handleImageUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    compressImage(file, (compressedFile) => {
      avatarFile.value = compressedFile;
      const reader = new FileReader();
      reader.onload = (e) => {
        profileImage.value = e.target?.result as string;
      };
      reader.readAsDataURL(compressedFile);
    });
  }
};

const compressImage = (file: File, callback: (f: File) => void) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              callback(newFile);
            }
          },
          "image/jpeg",
          0.8
        );
      }
    };
  };
};

const handleSubmit = async () => {
  if (!user.value) return;
  saving.value = true;
  try {
    if (avatarFile.value) {
      const formData = new FormData();
      formData.append("avatar", avatarFile.value);
      await api.post("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // No need to manually update local state from this call if we refetch user below
    }

    const payload: any = {
      username: form.value.username,
      name: form.value.name,
      lastname: form.value.lastname,
    };

    if (form.value.password) payload.password = form.value.password;

    await api.put(`/users/${user.value.id}`, payload);

    toast.success(
      "Perfil actualizado",
      "Los cambios se han guardado correctamente"
    );

    // Refresh global state
    await fetchUser();

    // Reload local form data
    loadProfile();
  } catch (error: any) {
    const errorMsg =
      error.response?.data?.message || "Error al actualizar perfil";
    toast.error("Error", errorMsg);
  } finally {
    saving.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Skeleton -->
      <div
        class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center animate-pulse h-fit">
        <div class="w-40 h-40 rounded-full bg-slate-700 mb-6"></div>
        <div class="w-3/4 h-8 bg-slate-700 rounded mb-2"></div>
        <div class="w-1/2 h-4 bg-slate-700 rounded mb-6"></div>
        <div class="w-24 h-8 bg-slate-700 rounded-full mb-8"></div>
        <div class="w-full h-40 bg-slate-700 rounded-xl"></div>
      </div>

      <!-- Right Skeleton -->
      <div
        class="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 animate-pulse">
        <div class="w-1/3 h-8 bg-slate-700 rounded mb-8"></div>
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <div class="w-20 h-4 bg-slate-700 rounded"></div>
              <div class="h-12 bg-slate-700 rounded-xl"></div>
            </div>
            <div class="space-y-2">
              <div class="w-20 h-4 bg-slate-700 rounded"></div>
              <div class="h-12 bg-slate-700 rounded-xl"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="w-32 h-4 bg-slate-700 rounded"></div>
            <div class="h-12 bg-slate-700 rounded-xl"></div>
          </div>
          <div class="space-y-2">
            <div class="w-24 h-4 bg-slate-700 rounded"></div>
            <div class="h-12 bg-slate-700 rounded-xl"></div>
          </div>

          <div class="border-t border-slate-700/50 pt-6 mt-6">
            <div class="w-1/4 h-6 bg-slate-700 rounded mb-4"></div>
            <div class="h-12 bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left: Avatar Card -->
      <!-- Left: Avatar Card (Modernized) -->
      <div
        class="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden h-fit relative group/card">
        <!-- Decorative Banner -->
        <div class="h-40 w-full absolute top-0 left-0 z-0 overflow-hidden">
          <!-- Dynamic Theme Gradient (Synced with theme config) -->
          <div
            :class="[
              'absolute inset-0 opacity-90 bg-linear-to-r',
              theme.sidebar.active
                .split(' ')
                .filter(
                  (c) =>
                    c.startsWith('from-') ||
                    c.startsWith('to-') ||
                    c.startsWith('via-') ||
                    c.startsWith('dark:')
                )
                .join(' '),
            ]"></div>
          <!-- Abstract shapes in banner -->
          <div
            class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div
            class="absolute top-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
        </div>

        <div
          class="p-8 pt-24 flex flex-col items-center text-center relative z-10">
          <!-- Avatar Container -->
          <div class="relative mb-6 group cursor-pointer inline-block">
            <!-- Glow effect behind avatar -->
            <div
              class="absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl scale-90 group-hover:scale-105 transition-transform duration-500"></div>

            <div
              class="relative w-48 h-48 rounded-full p-1.5 bg-slate-800 ring-4 ring-slate-800 shadow-2xl overflow-hidden">
              <img
                v-if="profileImage"
                :src="profileImage"
                class="w-full h-full rounded-full object-cover border-4 border-slate-700/50 transition-transform duration-500 group-hover:scale-110" />
              <div
                v-else
                :class="`w-full h-full rounded-full flex items-center justify-center text-7xl text-white bg-linear-to-br ${
                  form.avatarColor || 'from-primary to-accent'
                }`">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </div>

              <!-- Overlay Camera Icon -->
              <div
                @click="fileInput?.click()"
                class="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <i
                  class="fa-solid fa-camera text-3xl text-white mb-2 drop-shadow-lg"></i>
                <span
                  class="text-white text-xs font-bold uppercase tracking-wider drop-shadow-md"
                  >Cambiar Foto</span
                >
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="hidden" />
          </div>

          <!-- User Info -->
          <h2 class="text-3xl font-bold text-white mb-2 tracking-tight">
            {{ user?.name }} {{ user?.lastname }}
          </h2>

          <div class="flex flex-wrap justify-center gap-3 mb-8">
            <span
              class="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 text-sm font-medium flex items-center gap-2">
              <i class="fa-solid fa-at text-xs text-slate-400"></i>
              {{ user?.username }}
            </span>
            <span
              class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-shield-cat text-xs"></i>
              {{ user?.role }}
            </span>
          </div>

          <!-- Stats / Meta Grid -->
          <div class="w-full grid grid-cols-2 gap-4">
            <div
              class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-700/30 transition-colors">
              <span
                class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1"
                >Estado</span
              >
              <div
                class="flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 py-1 rounded-lg">
                <span class="relative flex h-2 w-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span
                    class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Activo
              </div>
            </div>

            <div
              class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-700/30 transition-colors">
              <span
                class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1"
                >Miembro desde</span
              >
              <div class="font-mono text-white text-sm py-1.5 font-medium">
                {{
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "-"
                }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Edit Form -->
      <div
        class="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl shadow-sm p-8">
        <h3
          class="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
          Editar Información
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-text-muted mb-1 text-sm">Nombre</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                required />
            </div>
            <div>
              <label class="block text-text-muted mb-1 text-sm">Apellido</label>
              <input
                v-model="form.lastname"
                type="text"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
                required />
            </div>
          </div>

          <div>
            <label class="block text-text-muted mb-1 text-sm"
              >Email (No editable)</label
            >
            <input
              v-model="form.email"
              type="email"
              class="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all opacity-50 cursor-not-allowed"
              disabled />
          </div>

          <div>
            <label class="block text-text-muted mb-1 text-sm">Username</label>
            <div class="relative">
              <i
                class="fa-solid fa-at absolute left-3 top-3 text-text-muted"></i>
              <input
                v-model="form.username"
                type="text"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all pl-10"
                required />
            </div>
          </div>

          <div class="pt-6 border-t border-white/10">
            <h3 class="text-lg font-bold text-white mb-4">
              Cambiar Contraseña
            </h3>
            <p class="text-sm text-text-muted mb-4">
              Deja este campo vacío si no quieres cambiarla.
            </p>

            <div class="relative">
              <i
                class="fa-solid fa-lock absolute left-3 top-3 text-text-muted"></i>
              <input
                v-model="form.password"
                type="password"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all pl-10"
                placeholder="Nueva contraseña" />
            </div>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button
              type="button"
              @click="loadProfile"
              class="px-6 py-2.5 rounded-xl border border-border text-white hover:bg-white/5 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm">
              {{ saving ? "Guardando..." : "Guardar Cambios" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
