import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSidebar from '../AppSidebar.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      nav: {
        tasks: 'Tareas',
        projects: 'Proyectos',
        tags: 'Etiquetas',
        profile: 'Perfil',
        dashboard: 'Dashboard',
        analytics: 'Analíticas',
        calendar: 'Calendario',
      },
    },
  },
});

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'tasks', component: { template: '<div>Tasks</div>' } },
    { path: '/projects', name: 'projects', component: { template: '<div>Projects</div>' } },
    { path: '/tags', name: 'tags', component: { template: '<div>Tags</div>' } },
    { path: '/profile', name: 'profile', component: { template: '<div>Profile</div>' } },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
  ],
});

describe('AppSidebar', () => {
  const mountSidebar = async (props = {}) => {
    const wrapper = mount(AppSidebar, {
      props,
      global: {
        plugins: [router, i18n],
      },
    });
    await router.isReady();
    return wrapper;
  };

  it('debe renderizar el sidebar correctamente', async () => {
    const wrapper = await mountSidebar();
    expect(wrapper.find('aside').exists()).toBe(true);
  });

  it('debe mostrar todos los enlaces de navegación', async () => {
    const wrapper = await mountSidebar();
    const links = wrapper.findAll('a');
    
    expect(links.length).toBeGreaterThan(0);
  });

  it('debe contener el enlace de Tareas', async () => {
    const wrapper = await mountSidebar();
    expect(wrapper.text()).toContain('Tareas');
  });

  it('debe contener el enlace de Proyectos', async () => {
    const wrapper = await mountSidebar();
    expect(wrapper.text()).toContain('Proyectos');
  });

  it('debe contener el enlace de Etiquetas', async () => {
    const wrapper = await mountSidebar();
    expect(wrapper.text()).toContain('Etiquetas');
  });

  it('debe contener el enlace de Perfil', async () => {
    const wrapper = await mountSidebar();
    expect(wrapper.text()).toContain('Perfil');
  });

  it('debe tener iconos en cada enlace de navegación', async () => {
    const wrapper = await mountSidebar();
    const icons = wrapper.findAll('svg');
    
    expect(icons.length).toBeGreaterThan(4);
  });

  it('debe aplicar clase activa a la ruta actual', async () => {
    const wrapper = await mountSidebar();
    await router.push('/');
    await wrapper.vm.$nextTick();
    
    const activeLink = wrapper.find('.router-link-active');
    expect(activeLink.exists()).toBe(true);
  });

  it('debe mostrar el selector de idioma', async () => {
    const wrapper = await mountSidebar();
    const languageButtons = wrapper.findAll('button').filter(btn => 
      btn.text().includes('ES') || btn.text().includes('EN')
    );
    
    expect(languageButtons.length).toBeGreaterThan(0);
  });

  it('debe tener estilos de glassmorphism', async () => {
    const wrapper = await mountSidebar();
    const aside = wrapper.find('aside');
    
    expect(aside.attributes('class')).toContain('backdrop-blur');
  });

  it('debe ser responsive', async () => {
    const wrapper = await mountSidebar();
    const aside = wrapper.find('aside');
    
    // Verificar que tiene clases responsive
    expect(aside.attributes('class')).toMatch(/md:|lg:/);
  });
});
