<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import { User, ShieldCheck } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { Loader2, ArrowLeft } from "lucide-vue-next";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const activeRole = ref<"user" | "admin">("user");
const flippedCard = ref<"user" | "admin" | null>(null);
const isLoading = ref(false);

const loginForm = ref({
  email: "",
  password: "",
  remember: false,
});

const selectRole = (role: "user" | "admin") => {
  // Flip the selected card
  flippedCard.value = role;
};

const handleLogin = async () => {
  isLoading.value = true;
  try {
    const user = await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
      remember: loginForm.value.remember,
      loginType: flippedCard.value || "user", // 'user' or 'admin'
    });

    toast.success(t("auth.welcome"), `Hola ${user.name}`);

    // Redirect based on actual role
    if (user.role === "admin" || user.role === "manager") {
      await router.push("/admin/overview");
    } else {
      await router.push("/dashboard");
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || t("auth.auth_failed");

    // Check for role mismatch errors
    if (err.response?.status === 403) {
      if (errorMessage.includes("administrator")) {
        toast.error(t("auth.error"), t("auth.role_mismatch_user"));
      } else if (errorMessage.includes("regular user")) {
        toast.error(t("auth.error"), t("auth.role_mismatch_admin"));
      } else {
        toast.error(t("auth.error"), errorMessage);
      }
    } else {
      toast.error(t("auth.error"), errorMessage);
    }
  } finally {
    isLoading.value = false;
  }
};

// Simple viewport check
const isDesktop = ref(window.innerWidth >= 768);

const isRegisterMode = ref(false);
const registerForm = ref({
  name: "",
  lastname: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    toast.error(t("auth.error"), t("auth.passwords_mismatch"));
    return;
  }

  isLoading.value = true;
  try {
    const user = await authStore.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
      name: registerForm.value.name,
      lastname: registerForm.value.lastname,
      role: "user", // Always register as 'user' from this card
    });

    toast.success(
      t("auth.welcome"),
      `Bienvenido, ${user.username || registerForm.value.name}`,
    );
    router.push("/dashboard");
  } catch (err: any) {
    const msg = err.response?.data?.message || t("auth.auth_failed");
    toast.error(t("auth.error"), msg);
  } finally {
    isLoading.value = false;
  }
};

const toggleAuthMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  // Reset forms on toggle if desired, or keep data
};
window.addEventListener("resize", () => {
  isDesktop.value = window.innerWidth >= 768;
});
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4">
    <LanguageSwitcher fixed />

    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style="
        background-image: url(&quot;https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop&quot;);
        filter: brightness(0.4);
      "></div>
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-4xl text-center">
      <!-- Header -->
      <div
        class="mb-16 animate-fade-in-down transition-all duration-500"
        :class="{ 'opacity-0 -translate-y-10': flippedCard }">
        <h1
          class="text-6xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight">
          {{ t("welcome.title") || "TaskFlow" }}
        </h1>
        <p
          class="text-xl md:text-2xl text-gray-200 font-light tracking-wide max-w-2xl mx-auto">
          {{
            t("welcome.subtitle") ||
            "Gestión inteligente para equipos de alto rendimiento. Identifícate para continuar."
          }}
        </p>
      </div>

      <!-- Role Selection Cards -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4 perspective-1000 items-center">
        <!-- User Card Container (3D Flip) -->
        <div
          v-show="activeRole === 'user' || isDesktop"
          class="relative w-full group cursor-pointer transition-all duration-500 ease-in-out"
          :class="{
            'hidden md:block': activeRole !== 'user',
            'z-50': flippedCard === 'user',
            'h-[400px]': !isRegisterMode,
            'h-[580px]': isRegisterMode,
          }">
          <div
            class="relative w-full h-full transition-all duration-700 transform-style-3d shadow-2xl rounded-3xl"
            :class="{ 'rotate-y-180': flippedCard === 'user' }">
            <!-- FRONT FACE -->
            <div
              @click="selectRole('user')"
              class="absolute inset-0 backface-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-blue-400/50 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 transition-all duration-300 cursor-pointer">
              <div
                class="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <User class="w-10 h-10 text-white" />
              </div>
              <div class="text-center">
                <h3 class="text-2xl font-bold text-white mb-2">
                  {{ t("welcome.user_card_title") || "Soy Usuario" }}
                </h3>
                <p class="text-gray-300 text-sm">
                  {{
                    t("welcome.user_card_desc") ||
                    "Accede a tus tareas, proyectos y calendario personal."
                  }}
                </p>
              </div>
              <div
                class="mt-4 px-6 py-2 rounded-full border border-white/30 text-white text-sm font-medium group-hover:bg-white group-hover:text-blue-600 transition-colors">
                {{ t("welcome.login_btn") || "Iniciar Sesión" }}
              </div>
            </div>

            <!-- BACK FACE (Login Form) -->
            <div
              class="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <!-- Back Button -->
              <button
                @click.stop="
                  flippedCard = null;
                  isRegisterMode = false;
                "
                class="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft class="w-6 h-6" />
              </button>

              <h3 class="text-2xl font-bold text-white mb-6 mt-2">
                {{
                  isRegisterMode
                    ? t("auth.create_account") || "Crear Cuenta"
                    : t("auth.welcome_back") || "Bienvenido"
                }}
              </h3>

              <div class="flex-1 flex flex-col justify-center">
                <!-- LOGIN FORM -->
                <form
                  v-if="!isRegisterMode"
                  @submit.prevent="handleLogin"
                  class="flex flex-col gap-4">
                  <div>
                    <input
                      v-model="loginForm.email"
                      type="email"
                      required
                      :placeholder="t('auth.email') || 'Correo electrónico'"
                      class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <input
                      v-model="loginForm.password"
                      type="password"
                      required
                      :placeholder="t('auth.password') || 'Contraseña'"
                      class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all" />
                  </div>

                  <div class="flex items-center gap-2">
                    <input
                      id="remember-me"
                      v-model="loginForm.remember"
                      type="checkbox"
                      class="w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500 bg-black/20" />
                    <label
                      for="remember-me"
                      class="text-sm text-gray-300 hover:text-white cursor-pointer select-none">
                      {{ t("auth.remember_me") }}
                    </label>
                  </div>

                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="mt-2 w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
                    <span v-else>{{ t("auth.sign_in") || "Entrar" }}</span>
                  </button>
                </form>

                <!-- REGISTER FORM -->
                <form
                  v-else
                  @submit.prevent="handleRegister"
                  class="flex flex-col gap-3">
                  <div class="grid grid-cols-2 gap-3">
                    <input
                      v-model="registerForm.name"
                      type="text"
                      required
                      :placeholder="t('auth.first_name') || 'Nombre'"
                      class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                      @click.stop />
                    <input
                      v-model="registerForm.lastname"
                      type="text"
                      required
                      :placeholder="t('auth.last_name') || 'Apellido'"
                      class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                      @click.stop />
                  </div>
                  <input
                    v-model="registerForm.username"
                    type="text"
                    required
                    :placeholder="t('auth.username') || 'Usuario'"
                    class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                    @click.stop />
                  <input
                    v-model="registerForm.email"
                    type="email"
                    required
                    :placeholder="t('auth.email') || 'Correo electrónico'"
                    class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                    @click.stop />
                  <div class="grid grid-cols-2 gap-3">
                    <input
                      v-model="registerForm.password"
                      type="password"
                      required
                      :placeholder="t('auth.password') || 'Contraseña'"
                      class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                      @click.stop />
                    <input
                      v-model="registerForm.confirmPassword"
                      type="password"
                      required
                      :placeholder="t('auth.confirm_password') || 'Confirmar'"
                      class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                      @click.stop />
                  </div>

                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="mt-4 w-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    @click.stop>
                    <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
                    <span v-else>{{
                      t("auth.create_account") || "Registrarse"
                    }}</span>
                  </button>
                </form>

                <!-- Toggle Mode Button -->
                <div class="mt-4 text-center">
                  <button
                    @click.stop="toggleAuthMode"
                    class="text-sm text-blue-300 hover:text-white transition-colors underline decoration-blue-500/30 underline-offset-4">
                    {{
                      isRegisterMode
                        ? t("auth.has_account") ||
                          "¿Ya tienes cuenta? Inicia sesión"
                        : t("auth.no_account") ||
                          "¿No tienes cuenta? Regístrate"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Card Container (3D Flip) -->
        <div
          v-show="activeRole === 'admin' || isDesktop"
          class="relative h-[400px] w-full group cursor-pointer"
          :class="{
            'hidden md:block': activeRole !== 'admin',
            'z-50': flippedCard === 'admin',
          }">
          <div
            class="relative w-full h-full transition-all duration-700 transform-style-3d shadow-2xl rounded-3xl"
            :class="{ 'rotate-y-180': flippedCard === 'admin' }">
            <!-- FRONT FACE -->
            <div
              @click="selectRole('admin')"
              class="absolute inset-0 backface-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-purple-400/50 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 transition-all duration-300 cursor-pointer">
              <div
                class="w-24 h-24 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck class="w-10 h-10 text-white" />
              </div>
              <div class="text-center">
                <h3 class="text-2xl font-bold text-white mb-2">
                  {{ t("welcome.admin_card_title") || "Administrador" }}
                </h3>
                <p class="text-gray-300 text-sm">
                  {{
                    t("welcome.admin_card_desc") ||
                    "Gestiona usuarios, configuraciones y reportes globales."
                  }}
                </p>
              </div>
              <div
                class="mt-4 px-6 py-2 rounded-full border border-white/30 text-white text-sm font-medium group-hover:bg-white group-hover:text-purple-600 transition-colors">
                {{ t("welcome.admin_access_btn") || "Acceso Admin" }}
              </div>
            </div>

            <!-- BACK FACE (Login Form - Purple Theme) -->
            <div
              class="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.2)]">
              <!-- Back Button -->
              <button
                @click.stop="flippedCard = null"
                class="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft class="w-6 h-6" />
              </button>

              <h3 class="text-2xl font-bold text-white mb-6 mt-2">
                {{ t("auth.admin_access") || "Acceso Admin" }}
              </h3>

              <form
                v-if="!isRegisterMode"
                @submit.prevent="handleLogin"
                class="flex flex-col gap-4">
                <div>
                  <input
                    v-model="loginForm.email"
                    type="email"
                    required
                    :placeholder="t('auth.email') || 'Correo electrónico'"
                    class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 outline-none transition-all" />
                </div>
                <div>
                  <input
                    v-model="loginForm.password"
                    type="password"
                    required
                    :placeholder="t('auth.password') || 'Contraseña'"
                    class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 outline-none transition-all" />
                </div>

                <div class="flex items-center gap-2">
                  <input
                    id="remember-me-admin"
                    v-model="loginForm.remember"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-500 text-purple-600 focus:ring-purple-500 bg-black/20" />
                  <label
                    for="remember-me-admin"
                    class="text-sm text-gray-300 hover:text-white cursor-pointer select-none">
                    {{ t("auth.remember_me") }}
                  </label>
                </div>

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="mt-2 w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
                  <span v-else>{{ t("auth.sign_in") || "Entrar" }}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Role Switch (Hide when flipped) -->
      <div v-if="!flippedCard" class="mt-8 md:hidden animate-fade-in-up">
        <button
          @click="activeRole = activeRole === 'user' ? 'admin' : 'user'"
          class="text-gray-300 hover:text-white text-sm font-medium flex items-center gap-2 mx-auto transition-colors px-4 py-2 rounded-full hover:bg-white/10 cursor-pointer">
          <span v-if="activeRole === 'user'">
            {{ t("welcome.are_you_admin") || "¿Eres administrador?" }}
            <span
              class="text-purple-400 underline decoration-purple-400/50 underline-offset-4"
              >{{ t("welcome.enter_here") || "Entra aquí" }}</span
            >
          </span>
          <span v-else>
            {{ t("welcome.not_admin") || "¿No eres administrador?" }}
            <span
              class="text-blue-400 underline decoration-blue-400/50 underline-offset-4"
              >{{ t("welcome.back_user") || "Volver a usuario" }}</span
            >
          </span>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="absolute bottom-8 text-center w-full z-10 transition-opacity duration-300"
      :class="{ 'opacity-0': flippedCard }">
      <p class="text-gray-400 text-sm">
        &copy; {{ new Date().getFullYear() }} TaskFlow.
        {{ t("welcome.rights_reserved") || "Todos los derechos reservados." }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
.animate-fade-in-down {
  animation: fadeInDown 1s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
span {
  color: inherit;
}
</style>
