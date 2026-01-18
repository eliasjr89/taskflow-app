import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import WelcomeView from "../WelcomeView.vue";
import { useAuthStore } from "@/stores/auth";

// Mock Vue I18n
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Router
const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
}));

// We also need to mock the router import in auth store so it doesn't fail
vi.mock("@/router", () => ({
  default: {
    push: mockPush,
  },
}));

// Mock Composables
vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("WelcomeView (Login)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders role selection cards", () => {
    const wrapper = mount(WelcomeView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          LanguageSwitcher: true,
          Loader2: true,
          User: true,
          ShieldCheck: true,
          ArrowLeft: true,
        },
      },
    });

    expect(wrapper.text()).toContain("welcome.user_card_title");
    expect(wrapper.text()).toContain("welcome.admin_card_title");
  });

  it("flips to login form when user card is clicked", async () => {
    const wrapper = mount(WelcomeView, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          LanguageSwitcher: true,
          Loader2: true,
          User: true,
          ShieldCheck: true,
          ArrowLeft: true,
        },
      },
    });

    // Click User Card (Front Face)
    const userCardFront = wrapper
      .findAll(".cursor-pointer")
      .find((w) => w.text().includes("welcome.user_card_title"));

    // Attempt click on the card area
    await userCardFront.trigger("click");

    expect(wrapper.vm.flippedCard).toBe("user");
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("calls authStore.login on form submission", async () => {
    const wrapper = mount(WelcomeView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })],
        stubs: {
          LanguageSwitcher: true,
          Loader2: true,
          User: true,
          ShieldCheck: true,
          ArrowLeft: true,
        },
      },
    });

    const authStore = useAuthStore();
    authStore.login = vi
      .fn()
      .mockResolvedValue({ name: "Test User", role: "user" });

    // Select User Role
    // We can modify the ref value directly in tests for setup if needed, but let's click
    // wrapper.vm.flippedCard = 'user'; // Not exposed

    // Simulate flipping
    const userCard = wrapper
      .findAll(".cursor-pointer")
      .find((el) => el.text().includes("welcome.user_card_title"));
    await userCard?.trigger("click");

    // Fill Form
    await wrapper.find('input[type="email"]').setValue("test@example.com");
    await wrapper.find('input[type="password"]').setValue("password");

    // Submit
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(authStore.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
      remember: false,
      loginType: "user",
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});
