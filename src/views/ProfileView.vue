<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "../composables/useToast";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import api from "../services/api";
import {
  Camera,
  Mail,
  Globe,
  Check,
  Pencil,
  Shield,
  MapPin,
  Link as LinkIcon,
  User as UserIcon,
  Bell,
  Moon,
  Smartphone,
} from "lucide-vue-next";
import { useSectionTheme } from "../composables/useSectionTheme";
import SkeletonLoader from "../components/common/SkeletonLoader.vue";

const { t, locale } = useI18n();
const { theme } = useSectionTheme();
const toast = useToast();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { fetchProfile: fetchUser, updateUser: updateUserState } = authStore;

const changeLanguage = (lang: string) => {
  locale.value = lang;
  localStorage.setItem("locale", lang);
};

const isLoading = ref(true);
const saving = ref(false);
const editingField = ref<string | null>(null);

const locations = [
  "Madrid, España",
  "Barcelona, España",
  "Sevilla, España",
  "Valencia, España",
  "Mexico City, México",
  "Buenos Aires, Argentina",
  "Bogotá, Colombia",
  "Santiago, Chile",
  "Lima, Perú",
  "Caracas, Venezuela",
  "Quito, Ecuador",
  "San José, Costa Rica",
  "Panamá City, Panamá",
  "Guatemala City, Guatemala",
  "San Salvador, El Salvador",
  "Tegucigalpa, Honduras",
  "Managua, Nicaragua",
  "Santo Domingo, República Dominicana",
  "San Juan, Puerto Rico",
  "Montevideo, Uruguay",
  "Asunción, Paraguay",
  "La Paz, Bolivia",
  "New York, USA",
  "London, UK",
  "Paris, France",
  "Berlin, Germany",
  "Tokyo, Japan",
];

const filteredLocations = ref<string[]>([]);
const showSuggestions = ref(false);

const onLocationInput = () => {
  const query = form.value.location.toLowerCase();
  if (query.length < 2) {
    filteredLocations.value = [];
    showSuggestions.value = false;
    return;
  }
  filteredLocations.value = locations
    .filter((l) => l.toLowerCase().includes(query))
    .slice(0, 5);
  showSuggestions.value = filteredLocations.value.length > 0;
};

const selectLocation = (loc: string) => {
  form.value.location = loc;
  showSuggestions.value = false;
  saveField("location");
};

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const form = ref({
  username: "",
  name: "",
  lastname: "",
  email: "",
  bio: "",
  location: "",
  website: "",
  password: "",
});

const loadProfile = async () => {
  isLoading.value = true;
  try {
    if (!user.value) {
      await fetchUser();
    }

    if (user.value) {
      form.value = {
        username: user.value.username || "",
        name: user.value.name || "",
        lastname: user.value.lastname || "",
        email: user.value.email || "",
        bio: user.value.bio || "",
        location: user.value.location || "",
        website: user.value.website || "",
        password: "",
      };
    }
  } finally {
    isLoading.value = false;
  }
};

const saveField = async (field: string) => {
  if (!user.value) return;
  saving.value = true;
  try {
    const payload: any = { [field]: (form.value as any)[field] };
    await api.put("/user/profile", payload);
    updateUserState(payload);
    editingField.value = null;
    toast.success(
      t("profile.success") || "Actualizado",
      `${field} ${t("profile.saved_success") || "guardado correctamente"}.`
    );
  } catch (err: any) {
    toast.error(
      "Error",
      err.response?.data?.message ||
        t("profile.error_saving") ||
        "No se pudo guardar."
    );
    loadProfile();
  } finally {
    saving.value = false;
  }
};

const toggleEdit = (field: string) => {
  if (editingField.value === field) {
    saveField(field);
  } else {
    editingField.value = field;
  }
};

// File Upload
const fileInput = ref<HTMLInputElement | null>(null);

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      saving.value = true;
      const response = await api.post("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = response.data.data.imageUrl;
      updateUserState({ profile_image: imageUrl });

      toast.success(
        t("profile.success") || "Éxito",
        t("profile.profile_updated") || "Imagen actualizada correctamente"
      );
    } catch {
      toast.error("Error", t("profile.error_image") || "Error al subir imagen");
    } finally {
      saving.value = false;
      if (fileInput.value) fileInput.value.value = "";
    }
  }
};

const updatePassword = async () => {
  if (!form.value.password || !user.value) return;
  saving.value = true;
  try {
    await api.put("/user/profile", { password: form.value.password });
    form.value.password = "";
    toast.success(t("profile.password_updated") || "Contraseña actualizada");
  } catch {
    toast.error(
      "Error",
      t("profile.error_password") || "No se pudo actualizar la contraseña."
    );
  } finally {
    saving.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="flex-1 flex flex-col w-full px-4 md:px-0 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-2">
        <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <UserIcon class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 block">
          {{ t("profile.title") }}
        </h1>
      </div>

      <!-- Language Switcher -->
      <div
        class="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
        <button
          @click="changeLanguage('es')"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-12 flex justify-center cursor-pointer border border-transparent"
          :class="
            locale === 'es'
              ? 'bg-indigo-500 text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          ">
          ES
        </button>
        <button
          @click="changeLanguage('en')"
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all w-12 flex justify-center cursor-pointer border border-transparent"
          :class="
            locale === 'en'
              ? 'bg-indigo-500 text-white shadow-md'
              : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          ">
          EN
        </button>
      </div>
    </div>
    <!-- Skeleton Loading -->
    <div v-if="isLoading">
      <SkeletonLoader type="banner" class="h-64 rounded-3xl mb-6" />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SkeletonLoader type="card" class="h-80" />
        <SkeletonLoader type="card" class="h-80 lg:col-span-2" />
      </div>
    </div>

    <div v-else class="space-y-8">
      <!-- Hidden File Input -->
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        @change="onFileChange" />

      <!-- Profile Banner Card -->
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
          class="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
          <!-- Avatar Section -->
          <div class="relative group shrink-0 mb-4 md:mb-0">
            <div
              class="w-40 h-40 md:w-48 md:h-48 rounded-full bg-slate-800 flex items-center justify-center shadow-2xl ring-4 ring-white/10 overflow-hidden relative border-4 border-white/5"
              :class="[
                !user?.profile_image
                  ? theme.gradients.blob1.replace('blur', '')
                  : '',
              ]">
              <img
                v-if="user?.profile_image"
                :src="user.profile_image"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <span v-else class="text-7xl font-bold text-white">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </span>

              <!-- Hover Overlay -->
              <div
                class="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
                @click="fileInput?.click()">
                <Camera class="w-10 h-10 text-white mb-1" />
                <span
                  class="text-[10px] text-white font-bold uppercase tracking-widest"
                  >{{ t("common.edit") || "Editar" }}</span
                >
              </div>
            </div>
          </div>

          <!-- Quick Info Section -->
          <div class="flex-1 text-center md:text-left">
            <div
              class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
              <h1
                class="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                {{ user?.name }} {{ user?.lastname }}
              </h1>
              <div class="flex justify-center gap-2">
                <span
                  class="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                  <Shield class="w-3 h-3 text-indigo-300" /> {{ user?.role }}
                </span>
                <span
                  class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <span
                    class="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  {{ t("profile.online") || "En Línea" }}
                </span>
              </div>
            </div>

            <div
              class="flex flex-wrap justify-center md:justify-start gap-4 text-white/60 text-sm mb-6">
              <span
                class="flex items-center gap-1.5 hover:text-white transition-colors">
                <UserIcon class="w-4 h-4 text-indigo-400/70" />
                @{{ user?.username }}
              </span>
              <span
                class="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail class="w-4 h-4 text-indigo-400/70" />
                {{ user?.email }}
              </span>
              <a
                v-if="user?.location"
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  user.location
                )}`"
                target="_blank"
                class="flex items-center gap-1.5 hover:text-white transition-colors group/loc">
                <MapPin
                  class="w-4 h-4 text-indigo-400 group-hover/loc:scale-110 transition-transform" />
                <span
                  class="border-b border-transparent group-hover/loc:border-indigo-400/50"
                  >{{ user.location }}</span
                >
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Body -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Bio & Identity -->
        <div class="space-y-8">
          <!-- Bio / Description -->
          <div
            class="bg-bg-dark border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group/bio">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <span class="text-indigo-400 font-serif text-2xl">"</span>
                {{ t("profile.about_me") || "Sobre mí" }}
              </h3>
              <button
                @click="toggleEdit('bio')"
                class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-indigo-600 transition-all cursor-pointer">
                <component
                  :is="editingField === 'bio' ? Check : Pencil"
                  class="w-4 h-4" />
              </button>
            </div>

            <div v-if="editingField === 'bio'">
              <textarea
                v-model="form.bio"
                rows="4"
                class="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                :placeholder="
                  t('profile.bio_placeholder') || 'Cuéntanos algo sobre ti...'
                "></textarea>
              <p class="text-[10px] text-white/40 mt-2 italic text-right">
                {{
                  t("profile.save_instruction") ||
                  "Haz clic en el check para guardar"
                }}
              </p>
            </div>
            <p
              v-else
              class="text-white/70 text-sm leading-relaxed min-h-[60px]">
              {{
                user?.bio ||
                t("profile.no_bio") ||
                "No has añadido una biografía todavía."
              }}
            </p>
          </div>

          <!-- Identity Details -->
          <div
            class="bg-bg-dark border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3
              class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <UserIcon class="w-5 h-5 text-indigo-400" />
              {{ t("profile.identity") || "Identidad Personal" }}
            </h3>
            <div class="space-y-5">
              <!-- Field: Name -->
              <div class="group/field relative">
                <label
                  class="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1"
                  >{{ t("profile.form.name") || "Nombre" }}</label
                >
                <div class="flex items-center justify-between">
                  <input
                    v-if="editingField === 'name'"
                    v-model="form.name"
                    @blur="saveField('name')"
                    @keyup.enter="saveField('name')"
                    class="bg-black/30 border-b border-indigo-500/50 p-1 text-white w-full outline-none" />
                  <span v-else class="text-white font-medium">{{
                    user?.name
                  }}</span>
                  <Pencil
                    v-if="editingField !== 'name'"
                    @click="editingField = 'name'"
                    class="w-3 h-3 text-white/20 opacity-0 group-hover/field:opacity-100 cursor-pointer hover:text-white transition-all ml-2" />
                </div>
              </div>
              <!-- Field: Lastname -->
              <div class="group/field relative">
                <label
                  class="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1"
                  >{{ t("profile.form.lastname") || "Apellido" }}</label
                >
                <div class="flex items-center justify-between">
                  <input
                    v-if="editingField === 'lastname'"
                    v-model="form.lastname"
                    @blur="saveField('lastname')"
                    @keyup.enter="saveField('lastname')"
                    class="bg-black/30 border-b border-indigo-500/50 p-1 text-white w-full outline-none" />
                  <span v-else class="text-white font-medium">{{
                    user?.lastname
                  }}</span>
                  <Pencil
                    v-if="editingField !== 'lastname'"
                    @click="editingField = 'lastname'"
                    class="w-3 h-3 text-white/20 opacity-0 group-hover/field:opacity-100 cursor-pointer hover:text-white transition-all ml-2" />
                </div>
              </div>
              <!-- Field: Username -->
              <div class="group/field relative">
                <label
                  class="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1"
                  >{{ t("profile.form.username") || "Usuario" }}</label
                >
                <div class="flex items-center justify-between">
                  <input
                    v-if="editingField === 'username'"
                    v-model="form.username"
                    @blur="saveField('username')"
                    @keyup.enter="saveField('username')"
                    class="bg-black/30 border-b border-indigo-500/50 p-1 text-white w-full outline-none" />
                  <span
                    v-else
                    class="text-white font-mono text-sm bg-white/5 px-2 py-0.5 rounded border border-white/5"
                    >@{{ user?.username }}</span
                  >
                  <Pencil
                    v-if="editingField !== 'username'"
                    @click="editingField = 'username'"
                    class="w-3 h-3 text-white/20 opacity-0 group-hover/field:opacity-100 cursor-pointer hover:text-white transition-all ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Contact & Security -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Social & Contact -->
          <div
            class="bg-bg-dark border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3
              class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Globe class="w-5 h-5 text-indigo-400" />
              {{ t("profile.contact") || "Contacto y Redes" }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Location -->
              <div
                class="group/field border border-white/5 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                @click="editingField = 'location'">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <MapPin class="w-4 h-4" />
                  </div>
                  <span
                    class="text-[10px] font-bold text-white/40 uppercase tracking-widest"
                    >{{ t("profile.location") || "Ubicación" }}</span
                  >
                </div>
                <div v-if="editingField === 'location'" class="relative">
                  <div class="flex gap-2">
                    <input
                      v-model="form.location"
                      @input="onLocationInput"
                      @keyup.enter="saveField('location')"
                      @blur="hideSuggestions"
                      class="bg-transparent border-b border-indigo-500 outline-none text-white w-full text-sm"
                      autofocus />
                    <button
                      @click.stop="saveField('location')"
                      class="text-emerald-500">
                      <Check class="w-4 h-4" />
                    </button>
                  </div>
                  <!-- Suggestions Dropdown -->
                  <div
                    v-if="showSuggestions"
                    class="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div
                      v-for="loc in filteredLocations"
                      :key="loc"
                      @click.stop="selectLocation(loc)"
                      class="px-4 py-2 text-sm text-white hover:bg-indigo-600 cursor-pointer transition-colors">
                      {{ loc }}
                    </div>
                  </div>
                </div>
                <div v-else class="text-white text-sm font-medium h-6">
                  {{
                    user?.location ||
                    t("profile.add_location") ||
                    "Añadir ubicación..."
                  }}
                </div>
              </div>

              <!-- Website -->
              <div
                class="group/field border border-white/5 rounded-xl p-4 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                @click="editingField = 'website'">
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <LinkIcon class="w-4 h-4" />
                  </div>
                  <span
                    class="text-[10px] font-bold text-white/40 uppercase tracking-widest"
                    >{{ t("profile.website") || "Sitio Web" }}</span
                  >
                </div>
                <div v-if="editingField === 'website'" class="flex gap-2">
                  <input
                    v-model="form.website"
                    @keyup.enter="saveField('website')"
                    class="bg-transparent border-b border-indigo-500 outline-none text-white w-full text-sm" />
                  <button
                    @click.stop="saveField('website')"
                    class="text-emerald-500">
                    <Check class="w-4 h-4" />
                  </button>
                </div>
                <div v-else class="text-white text-sm font-medium h-6 truncate">
                  {{
                    user?.website ||
                    t("profile.add_website") ||
                    "Añadir sitio web..."
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Security & Preferences -->
          <div
            class="bg-bg-dark border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <h3
              class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield class="w-5 h-5 text-indigo-400" />
              {{ t("profile.security") || "Seguridad y Acceso" }}
            </h3>

            <div class="space-y-6 max-w-lg relative z-10">
              <div class="space-y-2">
                <label
                  class="text-[10px] font-bold text-white/40 uppercase tracking-widest block"
                  >{{
                    t("profile.update_password") || "Actualizar Contraseña"
                  }}</label
                >
                <div class="flex gap-3">
                  <input
                    v-model="form.password"
                    type="password"
                    placeholder="••••••••••••"
                    class="flex-1 bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none transition-all" />
                  <button
                    @click="updatePassword"
                    :disabled="!form.password || saving"
                    class="px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                    {{ t("common.save") || "Guardar" }}
                  </button>
                </div>
              </div>

              <div class="pt-6 border-t border-white/5 space-y-6">
                <!-- 2FA -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                      <Smartphone
                        class="w-5 h-5 text-indigo-300 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-white">2FA</p>
                      <p class="text-[10px] text-white/40">
                        {{ t("profile.coming_soon") || "Próximamente" }}
                      </p>
                    </div>
                  </div>
                  <div
                    class="w-12 h-6 bg-white/10 rounded-full relative opacity-50 cursor-not-allowed">
                    <div
                      class="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full"></div>
                  </div>
                </div>

                <!-- Notifications (Placeholder) -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                      <Bell
                        class="w-5 h-5 text-indigo-300 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-white">
                        {{ t("profile.notifications") || "Notificaciones" }}
                      </p>
                      <p class="text-[10px] text-white/40">
                        {{ t("profile.coming_soon") || "Próximamente" }}
                      </p>
                    </div>
                  </div>
                  <div
                    class="w-12 h-6 bg-white/10 rounded-full relative opacity-50 cursor-not-allowed">
                    <div
                      class="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full"></div>
                  </div>
                </div>

                <!-- Dark Mode (Placeholder) -->
                <div class="flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                      <Moon
                        class="w-5 h-5 text-indigo-300 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-white">
                        {{ t("profile.dark_mode") || "Modo Oscuro" }}
                      </p>
                      <p class="text-[10px] text-white/40">
                        {{ t("profile.coming_soon") || "Próximamente" }}
                      </p>
                    </div>
                  </div>
                  <div
                    class="w-12 h-6 bg-indigo-500 rounded-full relative cursor-not-allowed opacity-80">
                    <div
                      class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
