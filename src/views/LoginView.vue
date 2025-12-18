<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "../services/api";
import { useToast } from "../composables/useToast";
import { useTaskState } from "../composables/useTaskState";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-vue-next";

const toast = useToast();
const { loadData } = useTaskState();
const router = useRouter(); // Restore router
const route = useRoute();
const { t } = useI18n();

// State
const showForm = ref(false); // Start false to animate in? Or just true. Let's animate in quickly.
const isLoginMode = ref(true);
const isLoading = ref(false);

const role = computed(() => route.query.role as string | undefined);
const isRoleAdmin = computed(() => role.value === "admin");

// Form Data
const formData = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  lastname: "",
});

onMounted(() => {
  // Si no hay rol especificado en la URL y estamos en modo login, redirigir a Welcome para forzar elección
  if (!route.query.role && isLoginMode.value) {
    router.replace({ name: "Welcome" });
    return;
  }

  // Direct animation
  setTimeout(() => {
    showForm.value = true;
  }, 100);
});

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  formData.value = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    lastname: "",
  };
};

const handleAuth = async () => {
  isLoading.value = true;
  try {
    if (isLoginMode.value) {
      // Login
      const response = await api.post("/auth/login", {
        email: formData.value.email,
        password: formData.value.password,
      });

      const resData = response.data.data || response.data;
      toast.success(
        t("auth.welcome"),
        `Bienvenido ${resData.user.name || resData.user.username}`
      );
      finalizeAuth(resData);
    } else {
      // Register
      if (formData.value.password !== formData.value.confirmPassword) {
        toast.error(t("auth.error"), t("auth.passwords_mismatch"));
        isLoading.value = false;
        return;
      }

      const response = await api.post("/auth/register", {
        username: formData.value.username,
        email: formData.value.email,
        password: formData.value.password,
        name: formData.value.name,
        lastname: formData.value.lastname,
      });
      const resData = response.data.data || response.data;
      finalizeAuth(resData);
      toast.success(t("auth.welcome"), t("auth.account_created"));
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || t("auth.auth_failed");
    toast.error(t("auth.error"), msg);
  } finally {
    isLoading.value = false;
  }
};

const finalizeAuth = async (data: any) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  await loadData();

  if (data.user.role === "admin" || data.user.role === "manager") {
    router.push("/admin/overview");
  } else {
    router.push("/dashboard");
  }
};
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
    <!-- Background Image with Overlay Removed to use DynamicBackground -->

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md px-4">
      <!-- Auth Form Phase -->
      <transition
        enter-active-class="transition duration-700 ease-out"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100">
        <div v-if="showForm" class="glass-panel p-8 rounded-3xl">
          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{
                isLoginMode
                  ? isRoleAdmin
                    ? "Acceso Administrativo"
                    : $t("auth.welcome_back")
                  : $t("auth.create_account")
              }}
            </h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              <span
                v-if="isRoleAdmin && isLoginMode"
                class="text-purple-400 font-medium"
                >Panel de Control Global</span
              >
              <span v-else>
                {{
                  isLoginMode
                    ? $t("auth.login_subtitle")
                    : $t("auth.register_subtitle")
                }}
              </span>
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleAuth" class="space-y-4">
            <!-- Register Fields -->
            <template v-if="!isLoginMode">
              <div class="space-y-4 animate-fade-in">
                <div class="relative">
                  <User
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    v-model="formData.username"
                    required
                    type="text"
                    :placeholder="$t('auth.username')"
                    class="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <input
                    v-model="formData.name"
                    type="text"
                    :placeholder="$t('auth.first_name')"
                    class="w-full glass-input rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none" />
                  <input
                    v-model="formData.lastname"
                    type="text"
                    :placeholder="$t('auth.last_name')"
                    class="w-full glass-input rounded-xl py-3 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none" />
                </div>
              </div>
            </template>

            <!-- Common Fields -->
            <div class="relative">
              <Mail
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="formData.email"
                required
                type="email"
                :placeholder="$t('auth.email')"
                class="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none" />
            </div>

            <div class="relative">
              <Lock
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="formData.password"
                required
                type="password"
                :placeholder="$t('auth.password')"
                class="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none" />
            </div>

            <div v-if="!isLoginMode" class="relative animate-fade-in">
              <Lock
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="formData.confirmPassword"
                required
                type="password"
                :placeholder="$t('auth.confirm_password')"
                class="w-full glass-input rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none" />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6">
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span v-else>{{
                isLoginMode ? $t("auth.sign_in") : $t("auth.create_account")
              }}</span>
              <ArrowRight v-if="!isLoading" class="w-5 h-5" />
            </button>
          </form>

          <!-- Toggle Mode -->
          <div class="mt-6 text-center">
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              {{ isLoginMode ? $t("auth.no_account") : $t("auth.has_account") }}
              <button
                @click="toggleMode"
                class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors focus:outline-none">
                {{ isLoginMode ? $t("auth.sign_up") : $t("auth.log_in") }}
              </button>
            </p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
