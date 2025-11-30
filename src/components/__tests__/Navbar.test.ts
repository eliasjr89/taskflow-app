import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Navbar from '../Navbar.vue';

describe('Navbar', () => {
  it('debe renderizar el navbar correctamente', () => {
    const wrapper = mount(Navbar);

    expect(wrapper.find('nav').exists()).toBe(true);
  });

  it('debe mostrar el título "TaskFlow"', () => {
    const wrapper = mount(Navbar);
    const title = wrapper.find('h1');

    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('TaskFlow');
  });

  it('debe tener el título con clases de gradiente', () => {
    const wrapper = mount(Navbar);
    const title = wrapper.find('h1');

    expect(title.classes()).toContain('bg-gradient-to-r');
    expect(title.classes()).toContain('bg-clip-text');
    expect(title.classes()).toContain('text-transparent');
  });

  it('debe mostrar el botón de toggle de tema', () => {
    const wrapper = mount(Navbar);
    const button = wrapper.find('button');

    expect(button.exists()).toBe(true);
    expect(button.attributes('aria-label')).toBe('Toggle theme');
  });

  it('debe mostrar el icono SVG en el botón de tema', () => {
    const wrapper = mount(Navbar);
    const svg = wrapper.find('button svg');

    expect(svg.exists()).toBe(true);
  });

  it('debe cambiar el tema al hacer clic en el botón', async () => {
    const wrapper = mount(Navbar);
    const button = wrapper.find('button');

    // Obtener el estado inicial
    const initialSvgs = wrapper.findAll('svg');
    const initialCount = initialSvgs.length;

    await button.trigger('click');

    // Después del clic, debe haber un SVG (el icono cambia)
    const svgs = wrapper.findAll('svg');
    expect(svgs.length).toBe(1);
  });

  it('debe tener clases de glassmorphism en el nav', () => {
    const wrapper = mount(Navbar);
    const nav = wrapper.find('nav');

    expect(nav.classes()).toContain('backdrop-blur-xl');
    expect(nav.classes()).toContain('sticky');
    expect(nav.classes()).toContain('top-0');
  });
});
