<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/services/api";
import { useToast } from "@/composables/useToast";
import { useSectionTheme } from "@/composables/useSectionTheme";
import { useUserState } from "@/composables/useUserState";

const toast = useToast();
const { theme } = useSectionTheme();
const { user, fetchUser, updateUserState } = useUserState();

const profileImage = ref<string | null>(null);
const loading = ref(true);
const saving = ref(false);

const fileInput = ref<HTMLInputElement | null>(null);
const avatarFile = ref<File | null>(null);

// Editing state for inline fields
const editingField = ref<string | null>(null);

const form = ref({
  username: "",
  email: "",
  name: "",
  lastname: "",
  bio: "",
  location: "",
  website: "",
  password: "",
});

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

const loadProfile = async () => {
  loading.value = true;
  try {
    if (!user.value) {
      await fetchUser();
    }

    if (user.value) {
      form.value = {
        username: user.value.username || "",
        email: user.value.email || "",
        name: user.value.name || "",
        lastname: user.value.lastname || "",
        bio: user.value.bio || "",
        location: user.value.location || "",
        website: user.value.website || "",
        password: "",
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
    compressImage(file, async (compressedFile) => {
      avatarFile.value = compressedFile;
      const reader = new FileReader();
      reader.onload = (e) => {
        profileImage.value = e.target?.result as string;
      };
      reader.readAsDataURL(compressedFile);

      // Upload immediately when changed
      const formData = new FormData();
      formData.append("avatar", compressedFile);
      try {
        const response = await api.post("/user/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const imageUrl = response.data.data.imageUrl;
        profileImage.value = imageUrl;
        updateUserState({ profile_image: imageUrl });

        toast.success("Foto actualizada", "Tu avatar ha sido actualizado.");
      } catch {
        toast.error("Error", "No se pudo subir la imagen.");
      }
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
      const MAX_WIDTH = 400; // Smaller for better performance
      const MAX_HEIGHT = 400;
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

const saveField = async (field: string) => {
  if (!user.value) return;
  saving.value = true;
  try {
    const payload: any = { [field]: (form.value as any)[field] };
    await api.put(`/users/${user.value.id}`, payload);
    updateUserState(payload);
    editingField.value = null;
    toast.success("Actualizado", `${field} guardado correctamente.`);
  } catch (err: any) {
    toast.error("Error", err.response?.data?.message || "No se pudo guardar.");
    // Revert form state if error (optional, but good)
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

const updatePassword = async () => {
  if (!form.value.password || !user.value) return;
  saving.value = true;
  try {
    await api.put(`/users/${user.value.id}`, { password: form.value.password });
    form.value.password = "";
    toast.success("Contraseña actualizada", "Tu contraseña ha sido cambiada.");
  } catch {
    toast.error("Error", "No se pudo actualizar la contraseña.");
  } finally {
    saving.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Hero Section -->
    <div
      class="relative rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
      <!-- Dynamic Banner -->
      <div class="h-48 md:h-64 relative overflow-hidden group">
        <div
          :class="[
            'absolute inset-0 bg-linear-to-r opacity-90 transition-all duration-700 group-hover:scale-105',
            theme.sidebar.active
              .split(' ')
              .filter(
                (c) =>
                  c.startsWith('from-') ||
                  c.startsWith('to-') ||
                  c.startsWith('via-')
              )
              .join(' '),
          ]"></div>
        <div class="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"></div>

        <!-- Abstract patterns -->
        <div
          class="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          class="absolute top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style="animation-delay: 1s"></div>
      </div>

      <div class="px-8 pb-10">
        <div
          class="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-24 relative z-10">
          <!-- Avatar wrapper -->
          <div
            class="relative group cursor-pointer"
            @click="fileInput?.click()">
            <div
              class="w-40 h-40 md:w-48 md:h-48 rounded-full p-2 bg-slate-800 ring-8 ring-slate-800 shadow-2xl overflow-hidden relative border-4 border-slate-700/50">
              <img
                v-if="profileImage"
                :src="profileImage"
                class="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div
                v-else
                class="w-full h-full rounded-full flex items-center justify-center text-7xl text-white bg-linear-to-br from-indigo-500 to-purple-600 font-bold">
                {{ user?.username?.charAt(0).toUpperCase() }}
              </div>

              <!-- Overlay -->
              <div
                class="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                <i class="fa-solid fa-camera text-3xl text-white mb-1"></i>
                <span
                  class="text-[10px] text-white font-bold uppercase tracking-widest"
                  >Cambiar</span
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

          <!-- Name and quick meta -->
          <div class="flex-1 text-center md:text-left mb-2">
            <div
              class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h1 class="text-4xl font-extrabold text-white tracking-tight">
                {{ user?.name }} {{ user?.lastname }}
              </h1>
              <div class="flex justify-center gap-2">
                <span
                  class="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <i class="fa-solid fa-shield-cat"></i> {{ user?.role }}
                </span>
                <span
                  class="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span
                    class="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  En Línea
                </span>
              </div>
            </div>
            <div
              class="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
              <span
                class="flex items-center gap-1.5 hover:text-white transition-colors">
                <i class="fa-solid fa-at text-indigo-400/70"></i>
                {{ user?.username }}
              </span>
              <span
                class="flex items-center gap-1.5 hover:text-white transition-colors">
                <i class="fa-solid fa-envelope text-indigo-400/70"></i>
                {{ user?.email }}
              </span>
              <a
                v-if="user?.location"
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  user.location
                )}`"
                target="_blank"
                class="flex items-center gap-1.5 hover:text-white transition-colors group/loc">
                <i
                  class="fa-solid fa-location-dot text-indigo-400/70 group-hover/loc:scale-110 transition-transform"></i>
                <span
                  class="border-b border-transparent group-hover/loc:border-indigo-400/50"
                  >{{ user.location }}</span
                >
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Body -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: About & Identity -->
      <div class="space-y-8">
        <!-- Bio / About -->
        <div
          class="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group/bio">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-quote-left text-indigo-500"></i> Sobre mí
            </h3>
            <button
              @click="toggleEdit('bio')"
              class="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all cursor-pointer">
              <i
                :class="[
                  'fa-solid',
                  editingField === 'bio' ? 'fa-check' : 'fa-pencil-alt',
                ]"></i>
            </button>
          </div>

          <div v-if="editingField === 'bio'">
            <textarea
              v-model="form.bio"
              rows="4"
              class="w-full bg-slate-900 border border-indigo-500/50 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
              placeholder="Cuéntanos algo sobre ti..."></textarea>
            <p class="text-[10px] text-slate-500 mt-2 italic text-right">
              Presiona el check para guardar
            </p>
          </div>
          <p v-else class="text-slate-300 text-sm leading-relaxed min-h-[60px]">
            {{
              user?.bio ||
              "No has añadido una biografía todavía. Haz clic en el lápiz para presentarte al equipo."
            }}
          </p>
        </div>

        <!-- Identity Details -->
        <div
          class="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i class="fa-solid fa-address-card text-indigo-500"></i> Identidad
            Personal
          </h3>
          <div class="space-y-5">
            <!-- Field: Name -->
            <div class="group/field relative">
              <label
                class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1"
                >Nombre</label
              >
              <div class="flex items-center justify-between">
                <input
                  v-if="editingField === 'name'"
                  v-model="form.name"
                  @blur="saveField('name')"
                  @keyup.enter="saveField('name')"
                  class="bg-slate-900 border-b border-indigo-500 p-1 text-white w-full outline-none" />
                <span v-else class="text-white font-medium">{{
                  user?.name
                }}</span>
                <i
                  v-if="editingField !== 'name'"
                  @click="editingField = 'name'"
                  class="fa-solid fa-pencil text-[10px] text-slate-600 opacity-0 group-hover/field:opacity-100 cursor-pointer hover:text-white transition-all ml-2"></i>
              </div>
            </div>
            <!-- Field: Lastname -->
            <div class="group/field relative">
              <label
                class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1"
                >Apellido</label
              >
              <div class="flex items-center justify-between">
                <input
                  v-if="editingField === 'lastname'"
                  v-model="form.lastname"
                  @blur="saveField('lastname')"
                  @keyup.enter="saveField('lastname')"
                  class="bg-slate-900 border-b border-indigo-500 p-1 text-white w-full outline-none" />
                <span v-else class="text-white font-medium">{{
                  user?.lastname
                }}</span>
                <i
                  v-if="editingField !== 'lastname'"
                  @click="editingField = 'lastname'"
                  class="fa-solid fa-pencil text-[10px] text-slate-600 opacity-0 group-hover/field:opacity-100 cursor-pointer hover:text-white transition-all ml-2"></i>
              </div>
            </div>
            <!-- Field: Username -->
            <div class="group/field relative">
              <label
                class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1"
                >Usuario</label
              >
              <div class="flex items-center justify-between">
                <input
                  v-if="editingField === 'username'"
                  v-model="form.username"
                  @blur="saveField('username')"
                  @keyup.enter="saveField('username')"
                  class="bg-slate-900 border-b border-indigo-500 p-1 text-white w-full outline-none" />
                <span
                  v-else
                  class="text-white font-mono text-sm bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50"
                  >@{{ user?.username }}</span
                >
                <i
                  v-if="editingField !== 'username'"
                  @click="editingField = 'username'"
                  class="fa-solid fa-pencil text-[10px] text-slate-600 opacity-0 group-hover/field:opacity-100 cursor-pointer hover:text-white transition-all ml-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center/Right Column: Connection & Security -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Social & Contact Grid -->
        <div
          class="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i class="fa-solid fa-earth-americas text-indigo-500"></i> Contacto
            y Redes
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Location -->
            <div
              class="group/field border border-slate-700/50 rounded-xl p-4 bg-slate-900/30 hover:bg-slate-700/20 transition-all cursor-pointer"
              @click="editingField = 'location'">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <i class="fa-solid fa-location-arrow"></i>
                </div>
                <span
                  class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                  >Ubicación</span
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
                    <i class="fa-solid fa-check"></i>
                  </button>
                </div>
                <!-- Suggestions Dropdown -->
                <div
                  v-if="showSuggestions"
                  class="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
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
                {{ user?.location || "Añadir ubicación..." }}
              </div>
            </div>

            <!-- Website -->
            <div
              class="group/field border border-slate-700/50 rounded-xl p-4 bg-slate-900/30 hover:bg-slate-700/20 transition-all cursor-pointer"
              @click="editingField = 'website'">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <i class="fa-solid fa-globe"></i>
                </div>
                <span
                  class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                  >Sitio Web / Portfolio</span
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
                  <i class="fa-solid fa-check"></i>
                </button>
              </div>
              <div v-else class="text-white text-sm font-medium h-6 truncate">
                {{ user?.website || "Añadir sitio web..." }}
              </div>
            </div>
          </div>
        </div>

        <!-- Security & Preferences -->
        <div
          class="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div
            class="absolute top-0 right-0 p-8 rotate-12 opacity-[0.03] text-indigo-500 group-hover:rotate-0 transition-transform duration-1000">
            <i class="fa-solid fa-shield-halved text-[200px]"></i>
          </div>

          <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i class="fa-solid fa-lock text-indigo-500"></i> Seguridad y Acceso
          </h3>

          <div class="space-y-6 max-w-lg">
            <div class="space-y-2">
              <label
                class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block"
                >Actualizar Contraseña</label
              >
              <div class="flex gap-3">
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="••••••••••••"
                  class="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-indigo-600 outline-none transition-all" />
                <button
                  @click="updatePassword"
                  :disabled="!form.password || saving"
                  class="px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20">
                  Cambiar
                </button>
              </div>
              <p class="text-[10px] text-slate-500 italic">
                Tu contraseña debe tener al menos 8 caracteres por seguridad.
              </p>
            </div>

            <div
              class="pt-6 border-t border-slate-700/50 flex items-center justify-between">
              <div>
                <h4 class="text-sm font-bold text-white mb-1">
                  Doble Factor (2FA)
                </h4>
                <p class="text-[10px] text-slate-500">
                  Aumenta la seguridad de tu cuenta con autenticación por móvil.
                </p>
              </div>
              <span
                class="px-3 py-1 bg-slate-700 text-slate-500 text-[10px] font-bold rounded-full uppercase cursor-not-allowed"
                >Próximamente</span
              >
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

input:focus {
  transition: all 0.2s ease;
}
</style>
