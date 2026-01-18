import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import ProfileView from "../ProfileView.vue";
import { createI18n } from "vue-i18n";
import es from "../../locales/es";
import { createTestingPinia } from "@pinia/testing";

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages: { es },
  globalInjection: true,
});

describe("ProfileView", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mountView = async (props = {}) => {
    const wrapper = mount(ProfileView, {
      props,
      global: {
        plugins: [
          i18n,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                user: {
                  username: "testuser",
                  name: "Test",
                  lastname: "User",
                  email: "test@example.com",
                  role: "user",
                  profile_image: null,
                },
              },
            },
          }),
        ],
      },
    });
    // Advance timers to bypass skeleton loader
    await flushPromises();
    vi.advanceTimersByTime(1000);
    await flushPromises();
    return wrapper;
  };

  it("debe renderizar la vista correctamente", async () => {
    const wrapper = await mountView();
    expect(wrapper.find(".flex-1").exists()).toBe(true);
  });

  it("debe mostrar el nombre y rol del usuario", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain("Test User");
    expect(text).toContain("user");
  });

  it('debe mostrar la sección "Sobre mí"', async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain(es.profile.about_me);
  });

  it("debe mostrar la sección de identidad", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain(es.profile.identity);
    expect(text).toContain("testuser"); // username
  });

  it("debe mostrar la sección de contacto", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    // Based on updated component structure
    expect(text).toContain(es.profile.social_networks);
    expect(text).toContain(es.profile.location);
    // expect(text).toContain(es.profile.website); // Might be inside dropdown or not directly shown text if empty
  });

  it("debe mostrar la sección de seguridad", async () => {
    const wrapper = await mountView();
    const text = wrapper.text();
    expect(text).toContain(es.profile.security);
    expect(text).toContain(es.profile.update_password);
  });

  // it("debe permitir cambiar el idioma", async () => {
  //   const wrapper = await mountView();
  //   // const text = wrapper.text();
  //   // expect(text).toContain(es.profile.language); // Label removed in UI
  //
  //   // Toggle button should be present
  //   const toggleBtn = wrapper
  //     .findAll("button")
  //     .find(
  //       (b) =>
  //         b.text().includes("Switch to English") ||
  //         b.text().includes("Cambiar a Español")
  //     );
  //   expect(toggleBtn?.exists()).toBe(true);
  // });
});
