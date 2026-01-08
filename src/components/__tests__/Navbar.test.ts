import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Navbar from "../layout/Navbar.vue";
import { createI18n } from "vue-i18n";
import es from "../../locales/es";
import { createRouter, createMemoryHistory } from "vue-router";

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: { es },
  globalInjection: true,
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/", component: { template: "<div></div>" } }],
});

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mountNavbar = () => {
    return mount(Navbar, {
      global: {
        plugins: [i18n, router],
      },
    });
  };

  it("debe renderizar el título TaskFlow", () => {
    const wrapper = mountNavbar();
    expect(wrapper.find("h1").text()).toBe("TaskFlow");
  });

  it("debe tener botón de cambio de tema", () => {
    const wrapper = mountNavbar();
    const themeBtn = wrapper.find('button[aria-label="Toggle theme"]');
    expect(themeBtn.exists()).toBe(true);
  });

  it("debe tener botón de cambio de idioma", () => {
    const wrapper = mountNavbar();
    const langBtn = wrapper.find(
      'button[title="' + es.tags.change_language + '"]'
    );
    expect(langBtn.exists()).toBe(true);
    // If locale is 'es', the button shows the OTHER language 'EN' to switch to.
    expect(langBtn.text()).toContain("EN");
  });

  it("debe tener botón de logout", () => {
    const wrapper = mountNavbar();
    const logoutBtn = wrapper.find("button svg.lucide-log-out").element
      .parentElement;
    expect(logoutBtn).toBeTruthy();
  });
});
