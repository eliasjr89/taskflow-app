<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "../services/api";
import { useFeedback } from "../composables/useFeedback";
import { useTaskState } from "../composables/useTaskState";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-vue-next";

const { showFeedback } = useFeedback();
const { loadData } = useTaskState();
const router = useRouter();
const { t } = useI18n();

// State
const isWelcomePhase = ref(true);
const showForm = ref(false);
const isLoginMode = ref(true);
const isLoading = ref(false);

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
  // Sequence: Welcome Image -> Form Appearance
  setTimeout(() => {
    isWelcomePhase.value = false;
    setTimeout(() => {
      showForm.value = true;
    }, 500); // Wait for welcome text fade out (optional)
  }, 2500);
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
      finalizeAuth(resData);
    } else {
      // Register
      if (formData.value.password !== formData.value.confirmPassword) {
        showFeedback(t("auth.error"), t("auth.passwords_mismatch"), "error");
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
      showFeedback(t("auth.welcome"), t("auth.account_created"), "success");
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || t("auth.auth_failed");
    showFeedback(t("auth.error"), msg, "error");
  } finally {
    isLoading.value = false;
  }
};

const finalizeAuth = async (data: any) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  await loadData();
  router.push("/");
};
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
    <!-- Background Image with Overlay Removed to use DynamicBackground -->

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md px-4">
      <!-- Welcome Phase -->
      <transition
        enter-active-class="transition duration-1000 ease-out"
        enter-from-class="transform opacity-0 translate-y-10"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-500 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-10">
        <div v-if="isWelcomePhase" class="text-center">
          <h1
            class="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500 mb-6 drop-shadow-lg">
            TaskFlow
          </h1>
          <p
            class="text-xl text-gray-600 dark:text-gray-300 font-light tracking-wide">
            {{ $t("auth.taskflow_slogan") }}
          </p>
        </div>
      </transition>

      <!-- Auth Form Phase -->
      <transition
        enter-active-class="transition duration-700 delay-200 ease-out"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100">
        <div v-if="showForm" class="glass-panel p-8 rounded-3xl">
          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{
                isLoginMode
                  ? $t("auth.welcome_back")
                  : $t("auth.create_account")
              }}
            </h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              {{
                isLoginMode
                  ? $t("auth.login_subtitle")
                  : $t("auth.register_subtitle")
              }}
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
