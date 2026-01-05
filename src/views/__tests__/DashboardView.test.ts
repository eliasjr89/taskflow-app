import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import DashboardView from "../DashboardView.vue";
import { createI18n } from "vue-i18n";
import { createRouter, createMemoryHistory } from "vue-router";
import es from "../../locales/es";
import { createTestingPinia } from "@pinia/testing";

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: { es },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", name: "dashboard", component: DashboardView },
    {
      path: "/tasks",
      name: "tasks",
      component: { template: "<div>Tasks</div>" },
    },
  ],
});

describe("DashboardView", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mountView = async (props = {}) => {
    const wrapper = mount(DashboardView, {
      props,
      global: {
        plugins: [
          i18n,
          router,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tasks: {
                tasks: [
                  {
                    id: 1,
                    title: "Task 1",
                    completed: false,
                    createdAt: new Date(),
                  },
                  {
                    id: 2,
                    title: "Task 2",
                    completed: true,
                    createdAt: new Date(),
                  },
                ],
              },
            },
          }),
        ],
      },
    });
    // Advance timers to bypass skeleton loader AND animation
    await flushPromises();
    vi.advanceTimersByTime(3000); // Increased time
    await flushPromises();
    return wrapper;
  };

  it("debe renderizar la vista correctamente", async () => {
    const wrapper = await mountView();
    expect(wrapper.find(".animate-fade-in").exists()).toBe(true);
  });

  it("debe mostrar tarjetas de estadísticas", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain(es.dashboard.total_tasks);
    expect(text).toContain(es.dashboard.completed);
    expect(text).toContain(es.dashboard.pending);
    expect(text).toContain(es.dashboard.success_rate);
  });

  it("debe renderizar el gráfico de progreso general", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain(es.dashboard.general_progress);
  });

  it("debe mostrar métricas numéricas correctas", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain("50%"); // Success rate
    expect(text).toContain("2"); // Total tasks
  });

  it("debe mostrar tareas recientes", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain(es.dashboard.recent_tasks);
    expect(text).toContain("Task 1");
    expect(text).toContain("Task 2");
  });

  it("debe tener enlace a ver todas las tareas", async () => {
    const wrapper = await mountView();
    const link = wrapper.find('a[href="/tasks"]');
    expect(link.exists()).toBe(true);
    // Use regex or partial match as text might include icon
    expect(link.text()).toContain(es.dashboard.view_all);
  });
});
