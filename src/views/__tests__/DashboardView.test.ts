import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import DashboardView from '../DashboardView.vue';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      dashboard: {
        title: 'Dashboard',
        overview: 'Resumen',
      },
    },
  },
});

describe('DashboardView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mountView = async (props = {}) => {
    const wrapper = mount(DashboardView, {
      props,
      global: {
        plugins: [i18n],
      },
    });
    await flushPromises();
    return wrapper;
  };

  it('debe renderizar la vista correctamente', async () => {
    const wrapper = await mountView();
    expect(wrapper.find('.flex-1').exists()).toBe(true);
  });

  it('debe mostrar el título del dashboard', async () => {
    const wrapper = await mountView();
    
    const hasTitle = wrapper.text().includes('Dashboard') ||
                     wrapper.text().includes('📊');
    
    expect(hasTitle).toBe(true);
  });

  it('debe mostrar tarjetas de estadísticas', async () => {
    const wrapper = await mountView();
    
    // Buscar tarjetas con clase glass-card o similar
    const cards = wrapper.findAll('.glass-card, .rounded-2xl');
    
    expect(cards.length).toBeGreaterThan(0);
  });

  it('debe mostrar métricas clave', async () => {
    const wrapper = await mountView();
    
    // Verificar que muestra números o porcentajes
    const hasMetrics = wrapper.text().match(/\d+/) !== null;
    
    expect(hasMetrics).toBe(true);
  });

  it('debe tener iconos en las tarjetas', async () => {
    const wrapper = await mountView();
    const icons = wrapper.findAll('svg');
    
    expect(icons.length).toBeGreaterThan(0);
  });

  it('debe mostrar información de proyectos', async () => {
    const wrapper = await mountView();
    
    const hasProjects = wrapper.text().includes('Proyectos') ||
                        wrapper.text().includes('proyecto');
    
    expect(hasProjects).toBe(true);
  });

  it('debe mostrar información de tareas', async () => {
    const wrapper = await mountView();
    
    const hasTasks = wrapper.text().includes('Tareas') ||
                     wrapper.text().includes('tarea');
    
    expect(hasTasks).toBe(true);
  });

  it('debe tener animación fade-in', async () => {
    const wrapper = await mountView();
    const mainDiv = wrapper.find('.flex-1');
    
    expect(mainDiv.attributes('class')).toContain('animate-fade-in');
  });

  it('debe ser responsive', async () => {
    const wrapper = await mountView();
    
    // Verificar que tiene clases responsive (md:, lg:, etc.)
    const html = wrapper.html();
    const hasResponsiveClasses = html.includes('md:') || html.includes('lg:');
    
    expect(hasResponsiveClasses).toBe(true);
  });

  it('debe mostrar gráficos o visualizaciones', async () => {
    const wrapper = await mountView();
    
    // Buscar elementos que podrían ser gráficos (canvas, svg, etc.)
    const hasVisuals = wrapper.findAll('svg, canvas').length > 0 ||
                       wrapper.findAll('.h-2, .h-3, .h-4').length > 0; // Barras de progreso
    
    expect(hasVisuals).toBe(true);
  });
});
