<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTaskState } from "../composables/useTaskState";
import { useTheme } from "../composables/useTheme";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useFeedback } from "../composables/useFeedback";
import api from "../services/api";
import {
  User,
  CheckCircle2,
  Moon,
  Sun,
  LogOut,
  Camera,
  Edit2,
  Save,
  X,
  Mail,
  Bell,
  Globe,
} from "lucide-vue-next";

const { resetState } = useTaskState();
const { isDark, toggleTheme } = useTheme();
const { t } = useI18n();
const router = useRouter();
const { showFeedback } = useFeedback();

// Preferences
const notificationsEnabled = ref(true);
const currentLanguage = ref("es");

// User Data
const userRaw = localStorage.getItem("user");
let initialUser = null;
try {
  initialUser = userRaw ? JSON.parse(userRaw) : null;
} catch {
  localStorage.removeItem("user");
}
const currentUser = ref(initialUser);
const isEditingProfile = ref(false);
const isLoadingProfile = ref(false);

const profileForm = ref({
  username: "",
  name: "",
  lastname: "",
  email: "",
  profile_image: "",
});

// Load full user data from API
onMounted(async () => {
  try {
    const response = await api.get("/user/profile");
    // ...

    const userData = response.data.data || response.data;

    if (userData) {
      currentUser.value = userData;
      localStorage.setItem("user", JSON.stringify(userData));

      // Populate form
      profileForm.value = {
        username: userData.username || "",
        name: userData.name || "",
        lastname: userData.lastname || "",
        email: userData.email || "",
        profile_image: userData.profile_image || "",
      };
    }
  } catch {
    // Error loading profile - silent fail
  }
});

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  resetState();
  router.push("/login");
};

// File Upload
const fileInput = ref<HTMLInputElement | null>(null);

const handleImageUpload = () => {
  fileInput.value?.click();
};

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      isLoadingProfile.value = true;
      const response = await api.post("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.data.imageUrl;

      if (currentUser.value) {
        currentUser.value.profile_image = imageUrl;
        localStorage.setItem("user", JSON.stringify(currentUser.value));
      }

      profileForm.value.profile_image = imageUrl;

      showFeedback(
        t("profile.success") || "Éxito",
        t("profile.profile_updated") || "Imagen actualizada correctamente",
        "success"
      );
    } catch {
      showFeedback("Error", "Error al subir imagen", "error");
    } finally {
      isLoadingProfile.value = false;
      // Reset input
      if (fileInput.value) fileInput.value.value = "";
    }
  }
};

const removeProfileImage = async () => {
  profileForm.value.profile_image = "";
  // Optional: Call API to clear it immediately or wait for save
  await saveProfile();
};

// ... Rest of profile logic ...

const saveProfile = async () => {
  isLoadingProfile.value = true;
  try {
    const response = await api.put("/user/profile", profileForm.value);
    const updatedUser = response.data.data || response.data;

    currentUser.value = updatedUser;
    localStorage.setItem("user", JSON.stringify(updatedUser));

    showFeedback(
      t("profile.success") || "Éxito",
      t("profile.profile_updated") || "Perfil actualizado correctamente",
      "success"
    );
    isEditingProfile.value = false;
  } catch (error: any) {
    const msg = error.response?.data?.message || "Error al actualizar perfil";
    showFeedback("Error", msg, "error");
  } finally {
    isLoadingProfile.value = false;
  }
};

const cancelEdit = () => {
  // Restore original values
  profileForm.value = {
    username: currentUser.value?.username || "",
    name: currentUser.value?.name || "",
    lastname: currentUser.value?.lastname || "",
    email: currentUser.value?.email || "",
    profile_image: currentUser.value?.profile_image || "",
  };
  isEditingProfile.value = false;
};
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-6 lg:px-8 animate-fade-in">
    <!-- Header -->
    <div class="mb-8 text-center md:text-left">
      <h1
        class="text-3xl md:text-4xl font-bold font-heading mb-2 flex items-center justify-center md:justify-start gap-2">
        <span>👤</span>
        <span
          class="bg-linear-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
          >{{ t("profile.title") }}</span
        >
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t("profile.subtitle") }}
      </p>
    </div>

    <div class="space-y-6">
      <!-- Hidden File Input -->
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        @change="onFileChange" />

      <!-- Profile Card with Luxury Design -->
      <div class="glass-card-luxury rounded-3xl p-8 relative overflow-hidden">
        <!-- Background Gradient Overlay -->
        <div
          class="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>

        <div
          class="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <!-- Avatar with Upload -->
          <div class="relative group">
            <div
              class="w-32 h-32 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20 dark:ring-gray-800/50 overflow-hidden transition-all duration-300 group-hover:scale-105">
              <img
                v-if="profileForm.profile_image"
                :src="profileForm.profile_image"
                alt="Profile"
                class="w-full h-full object-cover" />
              <User v-else class="w-16 h-16 text-white" />
            </div>

            <!-- Edit Overlay -->
            <div
              v-if="isEditingProfile"
              class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="handleImageUpload">
              <Camera class="w-8 h-8 text-white" />
            </div>

            <!-- Remove Image Button -->
            <button
              v-if="isEditingProfile && profileForm.profile_image"
              @click="removeProfileImage"
              class="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all z-10">
              <X class="w-4 h-4 text-white" />
            </button>

            <div
              class="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-lg">
              <CheckCircle2 class="w-5 h-5 text-white" />
            </div>
          </div>

          <!-- User Info & Edit Form -->
          <div class="flex-1 w-full">
            <template v-if="!isEditingProfile">
              <div class="text-center md:text-left">
                <h2
                  class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {{
                    currentUser?.name ||
                    currentUser?.username ||
                    t("profile.demo_user")
                  }}
                  {{ currentUser?.lastname || "" }}
                </h2>
                <p
                  class="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                  @{{ currentUser?.username }}
                </p>
                <div
                  class="flex items-center justify-center md:justify-start gap-2 text-gray-500 dark:text-gray-400 mb-6">
                  <Mail class="w-4 h-4" />
                  <span>{{ currentUser?.email || t("nav.subtitle") }}</span>
                </div>

                <div
                  class="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                    Full Stack Developer
                  </div>
                  <div
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                    Madrid, ES 📍
                  </div>
                </div>
              </div>
            </template>

            <!-- Edit Form -->
            <template v-else>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-4">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Username</label
                    >
                    <input
                      v-model="profileForm.username"
                      type="text"
                      class="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Email</label
                    >
                    <input
                      v-model="profileForm.email"
                      type="email"
                      class="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                <div class="space-y-4">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Nombre</label
                    >
                    <input
                      v-model="profileForm.name"
                      type="text"
                      class="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Apellido</label
                    >
                    <input
                      v-model="profileForm.lastname"
                      type="text"
                      class="w-full px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Action Buttons -->
            <div class="flex gap-3 justify-center md:justify-start mt-8">
              <button
                v-if="!isEditingProfile"
                @click="isEditingProfile = true"
                class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium">
                <Edit2 class="w-4 h-4" />
                {{ t("common.edit") || "Editar Perfil" }}
              </button>

              <template v-else>
                <button
                  @click="saveProfile"
                  :disabled="isLoadingProfile"
                  class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium disabled:opacity-50">
                  <Save class="w-4 h-4" />
                  {{ t("common.save") || "Guardar Cambios" }}
                </button>
                <button
                  @click="cancelEdit"
                  class="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium">
                  <X class="w-4 h-4" />
                  {{ t("common.cancel") || "Cancelar" }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="glass-card-luxury rounded-2xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          ⚙️ {{ t("profile.preferences") || "Preferencias" }}
        </h3>

        <div class="space-y-4">
          <!-- Theme Toggle -->
          <div
            class="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <component
                  :is="isDark ? Moon : Sun"
                  class="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">
                  {{ t("profile.theme") }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{
                    isDark ? t("profile.dark_mode") : t("profile.light_mode")
                  }}
                </p>
              </div>
            </div>
            <button
              @click="toggleTheme"
              class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
              :class="isDark ? 'bg-indigo-600' : 'bg-gray-300'">
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                :class="isDark ? 'translate-x-7' : 'translate-x-1'">
              </span>
            </button>
          </div>

          <!-- Notifications -->
          <div
            class="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Bell class="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">
                  Notificaciones
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Activar alertas por correo
                </p>
              </div>
            </div>
            <button
              @click="notificationsEnabled = !notificationsEnabled"
              class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
              :class="notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300'">
              <span
                class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                :class="
                  notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                ">
              </span>
            </button>
          </div>

          <!-- Language -->
          <div
            class="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Globe class="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100">
                  Idioma
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Seleccionar idioma de la interfaz
                </p>
              </div>
            </div>
            <button
              @click="currentLanguage = currentLanguage === 'es' ? 'en' : 'es'"
              class="relative inline-flex h-8 w-24 items-center justify-between rounded-full bg-gray-200 dark:bg-gray-700 p-1 transition-colors cursor-pointer">
              <span
                class="absolute h-6 w-[calc(50%-4px)] rounded-full bg-white dark:bg-gray-600 shadow-sm transition-all duration-300"
                :class="
                  currentLanguage === 'es' ? 'left-1' : 'left-[calc(50%+4px)]'
                ">
              </span>
              <span
                class="relative z-10 w-1/2 text-center text-xs font-bold transition-colors"
                :class="
                  currentLanguage === 'es'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500'
                ">
                ES
              </span>
              <span
                class="relative z-10 w-1/2 text-center text-xs font-bold transition-colors"
                :class="
                  currentLanguage === 'en'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500'
                ">
                EN
              </span>
            </button>
          </div>

          <!-- Logout Button -->
          <div
            class="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer group mt-4 border border-transparent hover:border-red-200 dark:hover:border-red-800"
            @click="handleLogout">
            <div class="flex items-center gap-3">
              <div
                class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                <LogOut class="w-5 h-5 text-amber-500 dark:text-red-400" />
              </div>
              <div>
                <p
                  class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {{ t("common.logout") || "Cerrar Sesión" }}
                </p>
                <p
                  class="text-sm text-gray-600 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-300 transition-colors">
                  {{ t("profile.logout_msg") || "Salir de la aplicación" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
