import { config } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { vi } from "vitest";

// Global mocks for common plugins
config.global.plugins = [
  createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
  }),
];

config.global.mocks = {
  $route: {
    path: "/",
    name: "home",
    params: {},
    query: {},
    meta: {},
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
  },
};

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

// Mock vue-router to work with Composition API useRoute/useRouter
// Mock vue-router to work with Composition API useRoute/useRouter
vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      path: "/",
      name: "home",
      params: {},
      query: {},
      meta: {},
    })),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
    })),
  };
});
