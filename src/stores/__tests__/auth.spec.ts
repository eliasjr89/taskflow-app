import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../auth";
import api from "../../services/api";

// Mock dependencies
vi.mock("../../services/api");
vi.mock("../../router", () => ({
  default: {
    push: vi.fn(),
  },
}));

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("initializes with no user or token", () => {
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it("login sets user and token (localStorage by default/remember=true)", async () => {
    const store = useAuthStore();
    const mockUser = {
      id: 1,
      email: "test@example.com",
      role: "user",
      username: "test",
      name: "Test",
      lastname: "User",
    };
    const mockResponse = { data: { token: "fake-token", user: mockUser } };

    // Mock API
    (api.post as any).mockResolvedValue(mockResponse);

    await store.login({
      email: "test@example.com",
      password: "pw",
      remember: true,
    });

    expect(store.token).toBe("fake-token");
    expect(store.user).toEqual(mockUser);
    expect(localStorage.getItem("token")).toBe("fake-token");
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("login with remember=false uses sessionStorage", async () => {
    const store = useAuthStore();
    const mockUser = {
      id: 1,
      email: "test@example.com",
      role: "user",
      username: "test",
      name: "Test",
      lastname: "User",
    };
    const mockResponse = { data: { token: "fake-token", user: mockUser } };

    (api.post as any).mockResolvedValue(mockResponse);

    await store.login({
      email: "test@example.com",
      password: "pw",
      remember: false,
    });

    expect(store.token).toBe("fake-token");
    expect(sessionStorage.getItem("token")).toBe("fake-token");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("logout clears state and storage", async () => {
    const store = useAuthStore();
    store.token = "token";
    store.user = { id: 1 } as any;
    localStorage.setItem("token", "token");

    await store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
