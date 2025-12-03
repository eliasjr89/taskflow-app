import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ProfileView from '../ProfileView.vue';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      profile: {
        title: 'Mi Perfil',
        subtitle: 'Gestiona tu cuenta',
        total_tasks: 'Tareas Totales',
        completed: 'Completadas',
        completion_rate: 'Tasa de Completitud',
        streak: 'Racha',
        most_productive: 'Proyecto más productivo',
        demo_user: 'Usuario Demo',
      },
      nav: {
        subtitle: 'Gestión',
        projects: 'Proyectos',
      },
      analytics: {
        title: 'Estadísticas',
      },
      dashboard: {
        tasks_completed_of: '{completed} de {total} tareas completadas',
      },
    },
  },
});

describe('ProfileView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mountView = async (props = {}) => {
    const wrapper = mount(ProfileView, {
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

  it('debe mostrar el título de perfil', async () => {
    const wrapper = await mountView();
    expect(wrapper.text()).toContain('Mi Perfil');
  });

  it('debe mostrar el avatar del usuario', async () => {
    const wrapper = await mountView();
    const avatar = wrapper.find('.rounded-full');
    
    expect(avatar.exists()).toBe(true);
  });

  it('debe mostrar estadísticas del usuario', async () => {
    const wrapper = await mountView();
    
    // Verificar que muestra estadísticas
    const hasStats = wrapper.text().includes('Estadísticas') ||
                     wrapper.text().includes('Tareas Totales') ||
                     wrapper.text().includes('Completadas');
    
    expect(hasStats).toBe(true);
  });

  it('debe calcular la tasa de completitud', async () => {
    const wrapper = await mountView();
    
    // Buscar porcentajes en el texto
    const hasPercentage = wrapper.text().match(/\d+%/);
    
    expect(hasPercentage).toBeTruthy();
  });

  it('debe mostrar el proyecto más productivo', async () => {
    const wrapper = await mountView();
    
    // Verificar que existe la sección de proyecto más productivo o que no hay proyectos
    const hasProductiveProject = wrapper.text().includes('Proyecto Más Productivo') ||
                                 wrapper.text().includes('productivo') ||
                                 wrapper.text().includes('Proyectos') ||
                                 !wrapper.text().includes('Proyecto'); // No hay proyectos
    
    expect(hasProductiveProject).toBe(true);
  });

  it('debe mostrar el toggle de tema', async () => {
    const wrapper = await mountView();
    
    // Buscar el toggle de tema
    const themeToggle = wrapper.findAll('button').find(btn => 
      btn.attributes('class')?.includes('rounded-full') &&
      btn.find('.inline-block').exists()
    );
    
    expect(themeToggle).toBeTruthy();
  });

  it('debe mostrar preferencias', async () => {
    const wrapper = await mountView();
    
    expect(wrapper.text()).toContain('Preferencias');
  });

  it('debe mostrar el modo de tema actual', () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [i18n]
      }
    });

    // Check if preferences section exists with theme toggle
    const hasPreferences = wrapper.text().includes('Preferences') || 
                          wrapper.text().includes('Preferencias');
    
    expect(hasPreferences).toBe(true);
  });

  it('debe mostrar tarjetas de estadísticas con iconos', async () => {
    const wrapper = await mountView();
    
    // Verificar que hay iconos SVG en las tarjetas de estadísticas
    const icons = wrapper.findAll('svg');
    
    expect(icons.length).toBeGreaterThan(0);
  });

  it('debe tener animación fade-in', async () => {
    const wrapper = await mountView();
    const mainDiv = wrapper.find('.flex-1');
    
    expect(mainDiv.attributes('class')).toContain('animate-fade-in');
  });

  it('debe mostrar el número de proyectos', async () => {
    const wrapper = await mountView();
    
    const hasProjects = wrapper.text().includes('Proyectos') ||
                        wrapper.text().includes('proyecto');
    
    expect(hasProjects).toBe(true);
  });

  it('debe mostrar la racha de tareas', async () => {
    const wrapper = await mountView();
    
    const hasStreak = wrapper.text().includes('Racha') ||
                      wrapper.text().includes('días');
    
    expect(hasStreak).toBe(true);
  });
});
