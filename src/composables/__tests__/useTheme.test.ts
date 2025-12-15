import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTheme } from "../useTheme";

describe("useTheme", () => {
  beforeEach(() => {
    // Limpiar localStorage
    localStorage.clear();
    // Limpiar clases del documentElement
    document.documentElement.className = "";
    // Resetear mocks
    vi.clearAllMocks();
  });

  it("debe inicializar con tema claro por defecto si no hay preferencia guardada", () => {
    // Mock de matchMedia para que retorne false (no prefiere dark mode)
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

    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it("debe inicializar con tema oscuro si está guardado en localStorage", () => {
    localStorage.setItem("theme", "dark");

    const { isDark } = useTheme();
    expect(isDark.value).toBe(true);
  });

  it("debe inicializar con tema claro si está guardado en localStorage", () => {
    localStorage.setItem("theme", "light");

    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it('debe aplicar clase "dark" al HTML cuando isDark es true', () => {
    localStorage.setItem("theme", "dark");

    useTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it('debe remover clase "dark" del HTML cuando isDark es false', () => {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.add("dark");

    useTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("debe cambiar el tema al llamar toggleTheme", () => {
    const { isDark, toggleTheme } = useTheme();
    const initialValue = isDark.value;

    toggleTheme();

    expect(isDark.value).toBe(!initialValue);
  });

  it("debe guardar el tema en localStorage al cambiar", () => {
    const { toggleTheme } = useTheme();

    toggleTheme();

    const savedTheme = localStorage.getItem("theme");
    expect(savedTheme).toBeDefined();
    expect(["dark", "light"]).toContain(savedTheme);
  });

  it("debe alternar entre dark y light al llamar toggleTheme múltiples veces", () => {
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
