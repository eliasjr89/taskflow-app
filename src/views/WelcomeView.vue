<script setup lang="ts">
import { useRouter } from "vue-router";
import { User, ShieldCheck } from "lucide-vue-next";

const router = useRouter();

const selectRole = (role: "user" | "admin") => {
  router.push({ name: "Login", query: { role } });
};
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style="
        background-image: url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop');
        filter: brightness(0.4);
      "></div>
    <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-4xl text-center">
      <!-- Header -->
      <div class="mb-16 animate-fade-in-down">
        <h1
          class="text-6xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight">
          TaskFlow
        </h1>
        <p
          class="text-xl md:text-2xl text-gray-200 font-light tracking-wide max-w-2xl mx-auto">
          Gestión inteligente para equipos de alto rendimiento. Identifícate
          para continuar.
        </p>
      </div>

      <!-- Role Selection Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-4">
        <!-- User Card -->
        <button
          @click="selectRole('user')"
          class="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-blue-400/50 rounded-3xl p-10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 text-left flex flex-col items-center gap-6">
          <div
            class="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <User class="w-10 h-10 text-white" />
          </div>
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white mb-2">Soy Usuario</h3>
            <p class="text-gray-300 text-sm">
              Accede a tus tareas, proyectos y calendario personal.
            </p>
          </div>
          <div
            class="mt-4 px-6 py-2 rounded-full border border-white/30 text-white text-sm font-medium group-hover:bg-white group-hover:text-blue-600 transition-colors">
            Iniciar Sesión
          </div>
        </button>

        <!-- Admin Card -->
        <button
          @click="selectRole('admin')"
          class="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-purple-400/50 rounded-3xl p-10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 text-left flex flex-col items-center gap-6">
          <div
            class="w-24 h-24 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <ShieldCheck class="w-10 h-10 text-white" />
          </div>
          <div class="text-center">
            <h3 class="text-2xl font-bold text-white mb-2">Administrador</h3>
            <p class="text-gray-300 text-sm">
              Gestiona usuarios, configuraciones y reportes globales.
            </p>
          </div>
          <div
            class="mt-4 px-6 py-2 rounded-full border border-white/30 text-white text-sm font-medium group-hover:bg-white group-hover:text-purple-600 transition-colors">
            Acceso Admin
          </div>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-8 text-center w-full z-10">
      <p class="text-gray-400 text-sm">
        &copy; {{ new Date().getFullYear() }} TaskFlow. Todos los derechos
        reservados.
      </p>
    </div>
  </div>
</template>

<style scoped>
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
</style>
