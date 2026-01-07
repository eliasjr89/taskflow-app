<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useSectionTheme } from "../../composables/useSectionTheme";
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";

const route = useRoute();
const { t, locale } = useI18n();
const { theme } = useSectionTheme();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { fetchProfile: fetchUser } = authStore;

const currentTime = ref("");
const currentDate = ref("");
let timer: number;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
  });
  currentDate.value = now.toLocaleDateString(locale.value, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const pageIcon = computed(() => {
  const path = route.path;
  if (path.includes("/dashboard")) return "fa-chart-pie";
  if (path.includes("/projects")) return "fa-briefcase";
  if (path.includes("/tasks")) return "fa-list-check";
  if (path.includes("/calendar")) return "fa-calendar";
  if (path.includes("/tags")) return "fa-tags";
  if (path.includes("/analytics")) return "fa-chart-line";
  if (path.includes("/profile")) return "fa-user-circle";
  return "fa-layer-group";
});

const pageTitle = computed(() => {
  const name = route.name?.toString() || "";
  const path = route.path;

  if (path.includes("/dashboard")) return t("nav.home");
  if (path.includes("/projects") && !path.includes("/admin"))
    return t("nav.projects");
  if (path.includes("/tasks") && !path.includes("/admin"))
    return t("nav.tasks");
  if (path.includes("/calendar")) return t("nav.calendar");
  if (path.includes("/tags")) return t("nav.tags");
  if (path.includes("/analytics")) return t("nav.analytics");
  if (path.includes("/profile") && !path.includes("/admin"))
    return t("nav.profile");

  // Admin Routes
  if (path.includes("/admin/overview")) return t("admin.overview");
  if (path.includes("/admin/users")) return t("admin.users");
  if (path.includes("/admin/projects")) return t("admin.projects");
  if (path.includes("/admin/tasks")) return t("admin.tasks");
  if (path.includes("/admin/database")) return t("admin.database");
  if (path.includes("/admin/roles")) return t("admin.roles");
  if (path.includes("/admin/audit")) return t("admin.audit");
  if (path.includes("/admin/settings")) return t("admin.settings");
  if (path.includes("/admin/profile")) return t("admin.profile");

  return route.meta.title?.toString() || name;
});

onMounted(async () => {
  updateTime();
  timer = setInterval(updateTime, 1000) as unknown as number;

  if (!user.value) {
    await fetchUser();
  }
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<template>
  <header
    class="relative mb-6 md:mb-8 rounded-2xl md:rounded-3xl overflow-visible px-4 py-4 md:px-8 md:py-6 border border-white/10 shadow-2xl min-h-[120px] md:min-h-[160px] flex items-center bg-bg-dark group mt-4 md:mt-8">
    <!-- Dynamic Background Blobs (Common) -->
    <div
      class="absolute inset-0 bg-bg-dark rounded-2xl md:rounded-3xl z-0 overflow-hidden">
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
        :class="[
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-all duration-1000 ease-in-out bg-linear-to-br',
          theme.gradients.blob3,
        ]"></div>

      <!-- Grid Pattern Overlay -->
      <div
        class="absolute inset-0 bg-[url('/img/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 z-0"></div>
    </div>

    <!-- ========================================== -->
    <!-- MOBILE CONTENT LAYOUT (Only visible < md) -->
    <!-- ========================================== -->
    <div
      class="md:hidden flex justify-between items-stretch w-full relative z-10 px-1">
      <!-- Left: TaskFlow (Dominant) + Page Title (Small) -->
      <div class="flex flex-col gap-2 justify-center h-full pb-1">
        <!-- TaskFlow Brand (Prominent but smaller) -->
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-linear-to-br border border-white/20',
              theme.sidebar.active
                .split(' ')
                .filter((c) => c.startsWith('from-') || c.startsWith('to-'))
                .join(' '),
            ]">
            <i class="fa-solid fa-layer-group text-lg text-white"></i>
          </div>
          <div class="flex flex-col leading-none">
            <span
              class="font-bold text-2xl text-white tracking-wide font-outfit drop-shadow-md"
              >TaskFlow<span class="text-white/60">.</span></span
            >
          </div>
        </div>

        <!-- Page Title (Small & Integrated) -->
        <div class="flex items-center gap-1.5 ml-1 opacity-90 mt-2">
          <!-- Mini Icon -->
          <div
            :class="[
              'w-4 h-4 rounded-md flex items-center justify-center text-[8px] text-white shadow-md bg-linear-to-br border border-white/10',
              theme.sidebar.active
                .split(' ')
                .filter((c) => c.startsWith('from-') || c.startsWith('to-'))
                .join(' '),
            ]">
            <transition name="fade" mode="out-in">
              <i :key="pageIcon" :class="['fa-solid', pageIcon]"></i>
            </transition>
          </div>
          <!-- Mini Title -->
          <div class="flex flex-col">
            <h2
              class="text-[10px] font-bold text-white leading-none uppercase tracking-wider">
              <transition name="fade" mode="out-in">
                <span :key="pageTitle">{{ pageTitle }}</span>
              </transition>
            </h2>
          </div>
        </div>
      </div>

      <!-- Right: Clock + Avatar (Top) & Language (Bottom) -->
      <div v-if="user" class="flex flex-col justify-between items-end py-1">
        <!-- Top: Clock & Avatar -->
        <div class="flex items-center gap-3">
          <!-- Clock (Left of Avatar) -->
          <div class="text-right flex flex-col justify-center">
            <div
              class="text-xs font-bold text-white font-mono leading-none drop-shadow-md">
              {{ currentTime }}
            </div>
            <div
              class="text-[8px] text-indigo-100/80 font-bold uppercase tracking-wide mt-0.5">
              {{ currentDate.split(",")[0] }}
            </div>
          </div>

          <!-- Avatar -->
          <router-link
            to="/profile"
            class="relative group cursor-pointer block">
            <img
              v-if="user.profile_image"
              :src="user.profile_image"
              class="w-12 h-12 rounded-full object-cover border-2 border-bg-dark shadow-lg relative z-10" />
            <div
              v-else
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg border-2 border-bg-dark relative z-10 bg-linear-to-br',
                theme.gradients.blob1.replace('blur', ''),
              ]">
              {{ user.username?.charAt(0).toUpperCase() }}
            </div>
            <!-- Online Dot -->
            <div
              class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-bg-dark rounded-full z-20"></div>
          </router-link>
        </div>

        <!-- Bottom: Language Switcher -->
        <div class="mt-2">
          <LanguageSwitcher />
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- DESKTOP CONTENT LAYOUT (Hidden < md)       -->
    <!-- ========================================== -->
    <div
      class="hidden md:flex w-full items-center justify-between relative z-10 ml-4">
      <!-- Left Content: Icon & Title (Desktop Standard) -->
      <div class="flex items-center gap-6">
        <!-- Themed Icon Container -->
        <div
          :class="[
            'w-20 h-20 rounded-2xl flex items-center justify-center text-4xl text-white shadow-2xl bg-linear-to-br border border-white/10 ring-4 ring-white/5',
            theme.sidebar.active
              .split(' ')
              .filter((c) => c.startsWith('from-') || c.startsWith('to-'))
              .join(' '),
          ]">
          <transition name="fade" mode="out-in">
            <i :key="pageIcon" :class="['fa-solid', pageIcon]"></i>
          </transition>
        </div>

        <div class="flex flex-col justify-center">
          <h2
            class="text-5xl font-bold text-white tracking-tight drop-shadow-xl font-outfit mb-1">
            <transition name="fade" mode="out-in">
              <span :key="pageTitle">{{ pageTitle }}</span>
            </transition>
          </h2>
          <div
            class="flex items-center gap-2 text-white/60 text-sm font-medium">
            <i class="fa-solid fa-layer-group text-xs"></i>
            <span>TaskFlow App</span>
          </div>
        </div>
      </div>

      <!-- Right Content: Clock & Avatar (Desktop Standard) -->
      <div v-if="user" class="flex items-center gap-10 mr-4">
        <LanguageSwitcher />
        <!-- Digital Clock -->
        <div class="text-right">
          <div
            class="text-2xl font-bold text-white font-mono tracking-widest drop-shadow-lg leading-none">
            {{ currentTime }}
          </div>
          <div
            class="text-[10px] text-indigo-200/80 font-bold uppercase tracking-widest text-right mt-1">
            {{ currentDate }}
          </div>
        </div>

        <!-- Vertical Divider -->
        <div class="w-px h-20 bg-white/10"></div>

        <!-- Massive Standalone Avatar -->
        <router-link
          to="/profile"
          class="group relative cursor-pointer"
          :title="t('nav.profile')">
          <!-- Outer Ring/Glow -->
          <div
            class="absolute -inset-4 rounded-full bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>

          <div
            class="relative transform transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <img
              v-if="user.profile_image"
              :src="user.profile_image"
              class="w-32 h-32 rounded-full object-cover border-4 border-bg-dark shadow-2xl ring-2 ring-white/10" />
            <div
              v-else
              :class="[
                'w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-2xl border-4 border-bg-dark ring-2 ring-white/10 bg-linear-to-br',
                theme.gradients.blob1.replace('blur', ''),
              ]">
              {{ user.username?.charAt(0).toUpperCase() }}
            </div>

            <!-- Online Status Dot -->
            <div
              class="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 border-2 border-bg-dark rounded-full shadow-lg"></div>
          </div>
        </router-link>
      </div>
    </div>
  </header>
</template>
