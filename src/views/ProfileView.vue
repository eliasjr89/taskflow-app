<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "../composables/useToast";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import LanguageSwitcher from "../components/common/LanguageSwitcher.vue";
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
  Smartphone,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Trash2,
} from "lucide-vue-next";
import { useSectionTheme } from "../composables/useSectionTheme";
import SkeletonLoader from "../components/common/SkeletonLoader.vue";

const { t, locale } = useI18n();
const { theme } = useSectionTheme();
const toast = useToast();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { fetchProfile: fetchUser, updateUser: updateUserState } = authStore;

const currentTime = ref(new Date());
let timer: any = null;

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentTime.value);
});

const formattedTime = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(currentTime.value);
});

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

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

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const form = ref({
  username: "",
  name: "",
  lastname: "",
  email: "",
  bio: "",
  location: "",
  website: "", // Legacy support
  password: "",
  social_links: [] as SocialLink[],
});

const newSocial = ref({
  platform: "github",
  url: "",
});

const getSocialIcon = (platform: string) => {
  const map: Record<string, any> = {
    github: Github,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    youtube: Youtube,
    facebook: Facebook,
    website: Globe,
    other: LinkIcon,
  };
  return map[platform.toLowerCase()] || LinkIcon;
};

const addSocialLink = () => {
  if (!newSocial.value.url) return;

  const link = {
    id: Date.now().toString(),
    ...newSocial.value,
  };

  form.value.social_links.push(link);
  saveField("social_links");

  newSocial.value.url = ""; // Reset input
};

const removeSocialLink = (index: number) => {
  form.value.social_links.splice(index, 1);
  saveField("social_links");
};

const formatUrl = (url: string) => {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
};

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
        social_links: (user.value.social_links as SocialLink[]) || [],
      };
    }
  } finally {
    isLoading.value = false;
  }
};

const saveField = async (field: string) => {
  if (!user.value || saving.value) return;

  // Check if value actually changed (Deep check for social_links)
  const currentValue = (user.value as any)[field];
  const newValue = (form.value as any)[field];

  if (field !== "social_links" && currentValue === newValue) {
    editingField.value = null;
    return;
  }

  saving.value = true;
  try {
    const payload: any = { [field]: newValue };
    await api.put("/user/profile", payload);
    updateUserState(payload);
    editingField.value = null;

    // Get translated field name
    const fieldName = t(`profile.form.${field}`) || field;

    toast.success(
      t("profile.success") || "Éxito",
      `${fieldName} ${t("profile.saved_success") || "guardado correctamente"}.`
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
  <div
    class="flex-1 flex flex-col w-full px-4 md:px-0 animate-fade-in mt-4 md:mt-8">
    <!-- Header -->
    <!-- Header Removed (Redundant) -->

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

        <!-- Main Layout with Flexbox for Desktop/Mobile Responsiveness -->
        <div
          class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 w-full h-full">
          <!-- Left Content: User Primary Info -->
          <div class="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1
                class="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-xl mb-2">
                {{ user?.name }} {{ user?.lastname }}
              </h1>
              <div class="flex flex-wrap justify-center md:justify-start gap-2">
                <span
                  class="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-md flex items-center gap-1.5 hover:bg-white/20 transition-all cursor-default">
                  <Shield class="w-3 h-3 text-indigo-300" /> {{ user?.role }}
                </span>
                <span
                  class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <span
                    class="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  {{ t("profile.online") || "En Línea" }}
                </span>
              </div>
            </div>

            <div
              class="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-white/70 text-sm">
              <span
                class="flex items-center gap-2 hover:text-white transition-colors group/info">
                <UserIcon
                  class="w-4 h-4 text-indigo-400/80 group-hover/info:scale-110 transition-transform" />
                <span class="font-mono">@{{ user?.username }}</span>
              </span>
              <span
                class="flex items-center gap-2 hover:text-white transition-colors group/info">
                <Mail
                  class="w-4 h-4 text-indigo-400/80 group-hover/info:scale-110 transition-transform" />
                {{ user?.email }}
              </span>
            </div>
          </div>

          <!-- Right Content: Date, Title, and Avatar -->
          <div
            class="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
            <!-- Date, Time and Language Switcher -->
            <div
              class="hidden md:flex flex-col items-center md:items-end justify-center">
              <p
                class="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-1">
                {{ formattedDate }}
              </p>
              <p
                class="text-3xl font-black text-white/90 tracking-tighter mb-4 font-mono">
                {{ formattedTime }}
              </p>
              <div class="scale-90 origin-right">
                <LanguageSwitcher />
              </div>
            </div>

            <!-- Vertical Separator -->
            <div
              class="hidden md:block h-16 w-px bg-white/10 mx-2 shadow-[0_0_10px_rgba(255,255,255,0.05)]"></div>

            <!-- Avatar Section -->
            <div class="relative group shrink-0">
              <div
                class="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-slate-800 flex items-center justify-center shadow-2xl ring-4 ring-white/5 overflow-hidden relative border border-white/10 group-hover:border-indigo-500/50 transition-all duration-500 transform group-hover:rotate-2"
                :class="[
                  !user?.profile_image
                    ? theme.gradients.blob1.replace('blur', '')
                    : '',
                ]">
                <img
                  v-if="user?.profile_image"
                  :src="user.profile_image"
                  class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                <span v-else class="text-6xl font-black text-white">
                  {{ user?.username?.charAt(0).toUpperCase() }}
                </span>

                <!-- Hover Overlay -->
                <div
                  class="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer"
                  @click="fileInput?.click()">
                  <Camera class="w-8 h-8 text-white mb-1 animate-bounce" />
                  <span
                    class="text-[9px] text-white font-black uppercase tracking-[0.3em]"
                    >{{ t("common.edit") || "Editar" }}</span
                  >
                </div>
              </div>
              <!-- Floating Edit Badge for Mobile -->
              <button
                @click="fileInput?.click()"
                class="absolute -bottom-2 -right-2 md:hidden w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center border-2 border-bg-dark">
                <Camera class="w-5 h-5" />
              </button>
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
          <!-- Location and Website -->
          <div
            class="bg-bg-dark border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3
              class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <MapPin class="w-5 h-5 text-indigo-400" />
              {{ t("profile.location") || "Ubicación" }}
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
            </div>
          </div>

          <!-- Social Links -->
          <div
            class="bg-bg-dark border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3
              class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Globe class="w-5 h-5 text-indigo-400" />
              {{ t("profile.social_networks") || "Redes Sociales" }}
            </h3>

            <!-- Add New Link -->
            <div class="mb-6 bg-white/5 rounded-xl p-4 border border-white/5">
              <div class="flex flex-col gap-3">
                <div class="flex gap-2">
                  <select
                    v-model="newSocial.platform"
                    class="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500">
                    <option value="github">GitHub</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="website">Website</option>
                    <option value="other">Otro</option>
                  </select>
                  <input
                    v-model="newSocial.url"
                    placeholder="https://..."
                    class="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500"
                    @keyup.enter="addSocialLink" />
                </div>
                <button
                  @click="addSocialLink"
                  :disabled="!newSocial.url"
                  class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ t("common.add") || "Añadir" }}
                </button>
              </div>
            </div>

            <!-- Links List -->
            <div class="space-y-3">
              <div
                v-for="(link, index) in form.social_links"
                :key="index"
                class="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10">
                <div class="flex items-center gap-3 overflow-hidden">
                  <div
                    class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <component
                      :is="getSocialIcon(link.platform)"
                      class="w-4 h-4 text-indigo-400" />
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span
                      class="text-[10px] font-bold text-white/40 uppercase tracking-widest"
                      >{{ link.platform }}</span
                    >
                    <a
                      :href="formatUrl(link.url)"
                      target="_blank"
                      class="text-sm text-white hover:text-indigo-400 truncate transition-colors"
                      >{{ link.url }}</a
                    >
                  </div>
                </div>
                <button
                  @click="removeSocialLink(index)"
                  class="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>

              <p
                v-if="form.social_links.length === 0"
                class="text-center text-white/30 text-xs py-4 italic">
                {{ t("profile.no_socials") || "No hay redes añadidas" }}
              </p>
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
                    class="px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 cursor-pointer">
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
