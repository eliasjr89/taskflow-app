<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTaskState } from "../composables/useTaskState";

import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useFeedback } from "../composables/useFeedback";
import api from "../services/api";
import { LogOut, Camera, Edit2, Save, X, Mail, Globe } from "lucide-vue-next";
import { useSectionTheme } from "../composables/useSectionTheme";
import SkeletonLoader from "../components/SkeletonLoader.vue";

const { resetState } = useTaskState();
const { t, locale } = useI18n();

const toggleLanguage = () => {
  locale.value = locale.value === "es" ? "en" : "es";
};
const { theme } = useSectionTheme();
const router = useRouter();
const { showFeedback } = useFeedback();

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
const isLoading = ref(true);

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
    // Simulate generic delay for skeleton demo
    await new Promise((resolve) => setTimeout(resolve, 600));
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
  } finally {
    isLoading.value = false;
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
  <div class="flex-1 flex flex-col w-full px-4 md:px-0 animate-fade-in">
    <!-- Skeleton Loading -->
    <div v-if="isLoading">
      <SkeletonLoader type="banner" class="h-64 rounded-3xl mb-6" />
      <SkeletonLoader type="card" :count="1" class="h-40" />
    </div>

    <div v-else class="space-y-6">
      <!-- Hidden File Input -->
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        @change="onFileChange" />

      <!-- Profile Banner Card (Dark Theme Enforced) -->
      <div
        class="relative rounded-3xl p-8 overflow-hidden bg-bg-dark border border-white/10 shadow-2xl min-h-[300px] flex flex-col justify-center">
        <!-- Dynamic Background Blobs -->
        <div
          class="absolute inset-0 bg-bg-dark rounded-3xl z-0 overflow-hidden">
          <div
            :class="[
              'absolute -top-24 -left-20 w-96 h-96 rounded-full blur-[80px] opacity-40 transition-all duration-1000 ease-in-out bg-linear-to-br',
              theme.gradients.blob1,
            ]"></div>
          <div
            :class="[
              'absolute -bottom-24 -right-20 w-96 h-96 rounded-full blur-[80px] opacity-30 transition-all duration-1000 ease-in-out bg-linear-to-br',
              theme.gradients.blob2,
            ]"></div>
          <div
            class="absolute inset-0 bg-[url('/img/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 z-0"></div>
        </div>

        <div
          class="relative z-10 flex flex-col-reverse md:flex-row items-center md:justify-between gap-10 w-full">
          <!-- Info / Form Section (Left now) -->
          <div class="flex-1 w-full text-center md:text-left">
            <template v-if="!isEditingProfile">
              <h2
                class="text-4xl font-bold text-white font-outfit mb-2 drop-shadow-md">
                {{ currentUser?.name || currentUser?.username }}
                {{ currentUser?.lastname }}
              </h2>
              <p
                class="text-xl text-indigo-200 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                <span class="text-white/60 text-base"
                  >@{{ currentUser?.username }}</span
                >
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span class="text-white/60 text-base">{{
                  t("profile.role")
                }}</span>
              </p>

              <div
                class="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                <div
                  class="px-4 py-2 rounded-xl bg-white/10 text-white text-sm backdrop-blur-md border border-white/5 flex items-center gap-2">
                  <Mail class="w-4 h-4 text-indigo-300" />
                  {{ currentUser?.email }}
                </div>
                <div
                  class="px-4 py-2 rounded-xl bg-white/10 text-white text-sm backdrop-blur-md border border-white/5 flex items-center gap-2">
                  <Globe class="w-4 h-4 text-indigo-300" />
                  {{ t("profile.location") }}
                </div>
              </div>
            </template>

            <template v-else>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="space-y-4">
                  <input
                    v-model="profileForm.username"
                    type="text"
                    :placeholder="t('profile.form.username')"
                    class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                  <input
                    v-model="profileForm.email"
                    type="email"
                    :placeholder="t('profile.form.email')"
                    class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                </div>
                <div class="space-y-4">
                  <input
                    v-model="profileForm.name"
                    type="text"
                    :placeholder="t('profile.form.name')"
                    class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                  <input
                    v-model="profileForm.lastname"
                    type="text"
                    :placeholder="t('profile.form.lastname')"
                    class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" />
                </div>
              </div>
            </template>

            <!-- Actions -->
            <div class="flex gap-3 justify-center md:justify-start">
              <button
                v-if="!isEditingProfile"
                @click="isEditingProfile = true"
                class="px-6 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2">
                <Edit2 class="w-4 h-4" /> {{ t("common.edit") }}
              </button>
              <template v-else>
                <button
                  @click="saveProfile"
                  :disabled="isLoadingProfile"
                  class="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2">
                  <Save class="w-4 h-4" /> {{ t("common.save") }}
                </button>
                <button
                  @click="cancelEdit"
                  class="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2 border border-white/10">
                  <X class="w-4 h-4" /> {{ t("common.cancel") }}
                </button>
              </template>
            </div>
          </div>

          <!-- Avatar Section (Right now) -->
          <div class="relative group shrink-0">
            <div
              class="w-40 h-40 rounded-full bg-linear-to-br flex items-center justify-center shadow-2xl ring-4 ring-white/10 overflow-hidden"
              :class="[
                profileForm.profile_image
                  ? ''
                  : theme.gradients.blob1.replace('blur', ''),
              ]">
              <img
                v-if="profileForm.profile_image"
                :src="profileForm.profile_image"
                class="w-full h-full object-cover" />
              <span v-else class="text-6xl font-bold text-white">{{
                currentUser?.username?.charAt(0).toUpperCase()
              }}</span>
            </div>
            <!-- Edit Overlay -->
            <div
              v-if="isEditingProfile"
              class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="handleImageUpload">
              <Camera class="w-10 h-10 text-white" />
            </div>
            <!-- Remove Button -->
            <button
              v-if="isEditingProfile && profileForm.profile_image"
              @click="removeProfileImage"
              class="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <X class="w-4 h-4 text-white" />
            </button>
            <div
              class="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-bg-dark rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- Settings Panel (Matching Dark/Glass Style) -->
      <div
        class="relative rounded-2xl p-6 bg-bg-dark border border-white/10 shadow-xl overflow-hidden">
        <div class="absolute inset-0 bg-white/5 z-0 pointer-events-none"></div>
        <div class="relative z-10">
          <h3
            class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            ⚙️ {{ t("profile.preferences") }}
          </h3>
          <div class="space-y-4">
            <!-- Language -->
            <div
              class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-white/10">
                  <Globe class="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <p class="font-medium text-white">
                    {{ t("profile.language") || "Idioma" }}
                  </p>
                  <p class="text-sm text-white/50">Español / English</p>
                </div>
              </div>
              <button
                @click="toggleLanguage"
                class="relative inline-flex h-8 w-24 items-center justify-between rounded-full bg-white/20 p-1 transition-colors cursor-pointer border border-white/10">
                <span
                  class="absolute h-6 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-all duration-300"
                  :class="
                    locale === 'es' ? 'left-1' : 'left-[calc(50%+4px)]'
                  "></span>
                <span
                  class="relative z-10 w-1/2 text-center text-xs font-bold transition-colors"
                  :class="locale === 'es' ? 'text-indigo-600' : 'text-white/50'"
                  >ES</span
                >
                <span
                  class="relative z-10 w-1/2 text-center text-xs font-bold transition-colors"
                  :class="locale === 'en' ? 'text-indigo-600' : 'text-white/50'"
                  >EN</span
                >
              </button>
            </div>

            <!-- Logout -->
            <div
              class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-red-900/20 hover:border-red-500/30 transition-all cursor-pointer group"
              @click="handleLogout">
              <div class="flex items-center gap-3">
                <div
                  class="p-2 rounded-lg bg-white/10 group-hover:bg-red-500/20 transition-colors">
                  <LogOut class="w-5 h-5 text-red-300" />
                </div>
                <div>
                  <p
                    class="font-medium text-white group-hover:text-red-200 transition-colors">
                    {{ t("common.logout") }}
                  </p>
                  <p
                    class="text-sm text-white/50 group-hover:text-red-300/70 transition-colors">
                    {{ t("profile.logout_msg") }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
