import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Welcome",
    component: () => import("../views/WelcomeView.vue"),
    meta: { title: "Bienvenida", public: true, layout: "AuthLayout" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/AboutView.vue"),
    meta: { title: "Sobre Nosotros", public: true, layout: "AuthLayout" },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { title: "Inicio", requiresUser: true, layout: "AppLayout" },
  },
  {
    path: "/tasks",
    name: "Tasks",
    component: () => import("../views/TasksView.vue"),
    meta: { title: "Tareas", requiresUser: true, layout: "AppLayout" },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("../views/ProjectsView.vue"),
    meta: { title: "Proyectos", requiresUser: true, layout: "AppLayout" },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("../views/CalendarView.vue"),
    meta: { title: "Calendario", requiresUser: true, layout: "AppLayout" },
  },
  {
    path: "/tags",
    name: "Tags",
    component: () => import("../views/TagsView.vue"),
    meta: { title: "Etiquetas", requiresUser: true, layout: "AppLayout" },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: () => import("../views/AnalyticsView.vue"),
    meta: { title: "Estadísticas", requiresUser: true, layout: "AppLayout" },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/ProfileView.vue"),
    meta: { title: "Perfil", requiresUser: true, layout: "AppLayout" },
  },

  // Admin Routes
  {
    path: "/admin",
    redirect: "/admin/overview",
    meta: { layout: "AdminLayout", requiresAdmin: true },
    children: [
      {
        path: "overview",
        name: "AdminOverview",
        component: () => import("../views/admin/Overview.vue"),
        meta: { layout: "AdminLayout", title: "Admin Overview" },
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/admin/UsersView.vue"),
        meta: { layout: "AdminLayout", title: "Gestión Usuarios" },
      },
      {
        path: "projects",
        name: "AdminProjects",
        component: () => import("../views/admin/ProjectsView.vue"),
        meta: { layout: "AdminLayout", title: "Gestión Proyectos" },
      },
      {
        path: "tasks",
        name: "AdminTasks",
        component: () => import("../views/admin/TasksView.vue"),
        meta: { layout: "AdminLayout", title: "Admin Tareas" },
      },
      {
        path: "database",
        name: "AdminDatabase",
        component: () => import("../views/admin/DatabaseView.vue"),
        meta: { layout: "AdminLayout", title: "Base de Datos" },
      },
      {
        path: "profile",
        name: "AdminProfile",
        component: () => import("../views/admin/ProfileView.vue"),
        meta: { layout: "AdminLayout", title: "Admin Perfil" },
      },
    ],
  },
  {
    path: "/exit",
    name: "Exit",
    component: () => import("../views/LogoutView.vue"),
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
    next({ name: "Welcome" });
  } else if (to.name === "Welcome" && token) {
    // If authenticated user hits Welcome, redirect to Dashboard/Admin
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "admin" || user.role === "manager") {
          next({ name: "AdminOverview" });
          return;
        }
      }
    } catch {
      /* ignore */
    }
    next({ name: "Dashboard" });
  } else {
    // Check Admin Access
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role !== "admin" && user.role !== "manager") {
            // User trying to access Admin route
            next({ name: "Dashboard" });
            return;
          }
        }
      } catch {
        /* ignore */
      }
    }

    // Check User Access (Prevent Admin from seeing User Dashboard)
    if (to.matched.some((record) => record.meta.requiresUser)) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === "admin" || user.role === "manager") {
            // Admin trying to access User route
            next({ name: "AdminOverview" });
            return;
          }
        }
      } catch {
        /* ignore */
      }
    }

    next();
  }
});

export default router;
