import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import LogoutView from "../views/LogoutView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { title: "Inicio" },
  },
  {
    path: "/tasks",
    name: "Tasks",
    component: () => import("../views/TasksView.vue"),
    meta: { title: "Tareas" },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("../views/ProjectsView.vue"),
    meta: { title: "Proyectos" },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("../views/CalendarView.vue"),
    meta: { title: "Calendario" },
  },
  {
    path: "/tags",
    name: "Tags",
    component: () => import("../views/TagsView.vue"),
    meta: { title: "Etiquetas" },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: () => import("../views/AnalyticsView.vue"),
    meta: { title: "Estadísticas" },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/ProfileView.vue"),
    meta: { title: "Perfil" },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
    meta: { title: "Iniciar Sesión", public: true },
  },
  {
    path: "/exit",
    name: "Exit",
    component: LogoutView,
    meta: { title: "Salida", public: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation Guard
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || "TaskFlow"} - TaskFlow`;

  const token = localStorage.getItem("token");
  const isPublic = to.meta.public;

  if (!isPublic && !token) {
    next({ name: "Login" });
  } else if (to.name === "Login" && token) {
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
