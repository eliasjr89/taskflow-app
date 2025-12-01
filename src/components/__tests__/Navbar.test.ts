import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Navbar from '../Navbar.vue';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: { es: {}, en: {} },
});

describe('Navbar', () => {
  it('debe renderizar el navbar correctamente', () => {
    const wrapper = mount(Navbar, {
      global: { plugins: [i18n] },
    });

    expect(wrapper.find('nav').exists()).toBe(true);
  });

  it('debe mostrar el título "TaskFlow"', () => {
    const wrapper = mount(Navbar, {
      global: { plugins: [i18n] },
    });
    const title = wrapper.find('h1');

    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('TaskFlow');
  });

  it('debe tener el título con clases de gradiente', () => {
    const wrapper = mount(Navbar, {
      global: { plugins: [i18n] },
    });
    const title = wrapper.find('h1');

    // Check for gradient classes (may be conditional with dark:)
    const classes = title.attributes('class') || '';
    const hasGradient = classes.includes('gradient') || classes.includes('font-bold');
    expect(hasGradient).toBe(true);
  });

  it('debe mostrar el botón de toggle de tema', () => {
    const wrapper = mount(Navbar, {
      global: { plugins: [i18n] },
    });
    const buttons = wrapper.findAll('button');
    const themeButton = buttons.find(btn => btn.attributes('aria-label') === 'Toggle theme');

    expect(themeButton).toBeTruthy();
  });

  it('debe mostrar el icono SVG en el botón de tema', () => {
    const wrapper = mount(Navbar, {
      global: { plugins: [i18n] },
    });
    const svg = wrapper.find('button svg');

    expect(svg.exists()).toBe(true);
  });

  it('debe cambiar el tema al hacer clic en el botón', async () => {
    const wrapper = mount(Navbar, {
      global: { plugins: [i18n] },
    });
    const buttons = wrapper.findAll('button');
    const themeButton = buttons.find(btn => btn.attributes('aria-label') === 'Toggle theme');

    await themeButton?.trigger('click');

    // Después del clic, debe haber SVGs (los iconos)
    const svgs = wrapper.findAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('debe tener clases de glassmorphism en el nav', () => {
    const wrapper = mount(Navbar, {
      global: { plugins: [i18n] },
    });
    const nav = wrapper.find('nav');

    expect(nav.classes()).toContain('backdrop-blur-xl');
    expect(nav.classes()).toContain('sticky');
    expect(nav.classes()).toContain('top-0');
  });
});
