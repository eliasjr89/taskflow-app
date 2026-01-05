import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import AppSidebar from "../AppSidebar.vue";
import { createI18n } from "vue-i18n";
import es from "../../../locales/es";
import { createRouter, createMemoryHistory } from "vue-router";
import { createTestingPinia } from "@pinia/testing";

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: { es },
  globalInjection: true,
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/", component: { template: "" } }],
});

describe("AppSidebar", () => {
  const mountSidebar = () => {
    return mount(AppSidebar, {
      global: {
        plugins: [
          i18n,
          router,
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
    });
  };

  it("debe renderizar la sidebar", () => {
    const wrapper = mountSidebar();
    expect(wrapper.find("aside").exists()).toBe(true);
  });

  it('debe mostrar el título "TaskFlow" cuando no está colapsado', () => {
    const wrapper = mountSidebar();
    expect(wrapper.text()).toContain("TaskFlow");
  });

  it("debe mostrar los enlaces de navegación", () => {
    const wrapper = mountSidebar();
    expect(wrapper.text()).toContain(es.nav.home);
    expect(wrapper.text()).toContain(es.nav.tasks);
    expect(wrapper.text()).toContain(es.nav.projects);
  });

  it("debe tener botón de logout", () => {
    const wrapper = mountSidebar();
    const logoutBtn = wrapper.find(".group-logout");
    expect(logoutBtn.exists()).toBe(true);
    expect(logoutBtn.text()).toContain(es.common.logout);
  });

  it("debe colapsar la sidebar al hacer clic en el botón", async () => {
    const wrapper = mountSidebar();
    const toggleBtn = wrapper.find("button.absolute");
    await toggleBtn.trigger("click");
    expect(wrapper.find("aside").classes()).toContain("w-20");
  });
});
