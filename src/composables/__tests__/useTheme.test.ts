import { describe, it, expect, beforeEach, vi } from "vitest";

describe("useTheme", () => {
  beforeEach(() => {
    // Limpiar localStorage
    localStorage.clear();
    // Limpiar clases del documentElement
    document.documentElement.className = "";
    // Resetear mocks
    vi.clearAllMocks();
    // Reset modules to re-initialize the singleton ref in useTheme
    vi.resetModules();
  });

  async function getUseTheme() {
    // Dynamic import to get a fresh instance after resetModules
    const { useTheme } = await import("../useTheme");
    return useTheme;
  }

  it("debe inicializar con tema claro por defecto si no hay preferencia guardada", async () => {
    // Mock de matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const useTheme = await getUseTheme();
    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it("debe inicializar con tema oscuro si está guardado en localStorage", async () => {
    localStorage.setItem("theme", "dark");

    const useTheme = await getUseTheme();
    const { isDark } = useTheme();
    expect(isDark.value).toBe(true);
  });

  it("debe inicializar con tema claro si está guardado en localStorage", async () => {
    localStorage.setItem("theme", "light");

    const useTheme = await getUseTheme();
    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it('debe aplicar clase "dark" al HTML cuando isDark es true', async () => {
    localStorage.setItem("theme", "dark");
    const useTheme = await getUseTheme();

    // Just calling it should apply theme because of initial execution or watch?
    // In useTheme.ts:
    // const isDark = ...
    // ...
    // watch(isDark, ...)
    // But applyTheme() is not called on init immediately?
    // Init logic:
    // Line 17: export const initTheme = () => { applyTheme(); };
    // useTheme function doesn't call initTheme.
    // However, isDark is ref.
    // Wait, useTheme.ts DOES apply theme on watch.
    // usage in App.vue likely calls initTheme().
    // userTheme() just returns the ref.
    // BUT, isDark logic is: initializes ref.
    // If I want to test "applyTheme" side effect on initialization:
    // I need to call initTheme or verify app logic.
    // But wait, the test says "debe guardar etiquetas..." or "debe aplicar clase".
    // If usage is: user calls useTheme() => gets ref. Change ref => watch => applyTheme.
    // Initialization: `isDark` is set. But `applyTheme` isn't called unless `initTheme` is called or watch fires.
    // Watch typically fires lazily or immediately? with `watch(source, cb)` it's lazy. `watchEffect` is immediate.
    // useTheme.ts uses `watch(isDark, ...)`.
    // So on init, applyTheme is NOT called automatically by `useTheme()`.
    // The test `debe aplicar clase dark` might fail if it expects automatic application.
    // Previous test passed? Or failed?
    // Ideally I should import `initTheme` too.

    // Let's modify the test to import initTheme if needed or just trigger change.

    const { isDark } = useTheme();
    // Simulate App initialization
    const { initTheme } = await import("../useTheme");
    initTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it('debe remover clase "dark" del HTML cuando isDark es false', async () => {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.add("dark");

    const useTheme = await getUseTheme();
    const { initTheme } = await import("../useTheme");
    initTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("debe cambiar el tema al llamar toggleTheme", async () => {
    const useTheme = await getUseTheme();
    const { isDark, toggleTheme } = useTheme();
    const initialValue = isDark.value;

    toggleTheme();

    expect(isDark.value).toBe(!initialValue);
  });

  it("debe guardar el tema en localStorage al cambiar", async () => {
    const useTheme = await getUseTheme();
    const { toggleTheme } = useTheme();

    toggleTheme();
    await new Promise((resolve) => setTimeout(resolve, 0)); // wait for watch? Sync?

    const savedTheme = localStorage.getItem("theme");
    expect(savedTheme).toBeDefined();
    expect(["dark", "light"]).toContain(savedTheme);
  });

  it("debe alternar entre dark y light al llamar toggleTheme múltiples veces", async () => {
    const useTheme = await getUseTheme();
    const { isDark, toggleTheme } = useTheme();
    const initial = isDark.value;

    toggleTheme();
    expect(isDark.value).toBe(!initial);

    toggleTheme();
    expect(isDark.value).toBe(initial);

    toggleTheme();
    expect(isDark.value).toBe(!initial);
  });
});
