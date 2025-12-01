import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmationModal from '../ConfirmationModal.vue';
import { createI18n } from 'vue-i18n';
import es from '../../locales/es';

const i18n = createI18n({
  legacy: false,
  locale: 'es',
  messages: {
    es
  }
});

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Confirmar acción',
    message: '¿Estás seguro de que quieres continuar?',
  };

  const mountModal = (props = {}) => {
    return mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        plugins: [i18n]
      }
    });
  };

  it('debe renderizar el modal cuando isOpen es true', () => {
    const wrapper = mountModal();
    expect(wrapper.find('.fixed').exists()).toBe(true);
  });

  it('no debe renderizar el modal cuando isOpen es false', () => {
    const wrapper = mountModal({ isOpen: false });
    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('debe mostrar el título proporcionado', () => {
    const wrapper = mountModal({ title: 'Título de prueba' });
    expect(wrapper.text()).toContain('Título de prueba');
  });

  it('debe mostrar el mensaje proporcionado', () => {
    const wrapper = mountModal({ message: 'Mensaje de prueba' });
    expect(wrapper.text()).toContain('Mensaje de prueba');
  });

  it('debe mostrar el icono de alerta', () => {
    const wrapper = mountModal();
    const alertIcon = wrapper.find('svg');
    expect(alertIcon.exists()).toBe(true);
  });

  it('debe emitir evento close al hacer clic en cancelar', async () => {
    const wrapper = mountModal();
    const cancelButton = wrapper.findAll('button')[0];
    
    await cancelButton.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('debe emitir evento confirm al hacer clic en confirmar', async () => {
    const wrapper = mountModal();
    const confirmButton = wrapper.findAll('button')[1];
    
    await confirmButton.trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('debe emitir evento close al hacer clic en el backdrop', async () => {
    const wrapper = mountModal();
    const backdrop = wrapper.find('.absolute.inset-0');
    
    await backdrop.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('debe usar texto personalizado para el botón de confirmar', () => {
    const wrapper = mountModal({ confirmText: 'Eliminar' });
    expect(wrapper.text()).toContain('Eliminar');
  });

  it('debe usar texto personalizado para el botón de cancelar', () => {
    const wrapper = mountModal({ cancelText: 'No, volver' });
    expect(wrapper.text()).toContain('No, volver');
  });

  it('debe usar texto por defecto si no se proporciona confirmText', () => {
    const wrapper = mountModal();
    const buttons = wrapper.findAll('button');
    const confirmButton = buttons[1];
    
    expect(confirmButton.text()).toBeTruthy();
  });

  it('debe usar texto por defecto si no se proporciona cancelText', () => {
    const wrapper = mountModal();
    const buttons = wrapper.findAll('button');
    const cancelButton = buttons[0];
    
    expect(cancelButton.text()).toBeTruthy();
  });

  it('debe tener estilos de peligro por defecto', () => {
    const wrapper = mountModal();
    const confirmButton = wrapper.findAll('button')[1];
    
    expect(confirmButton.attributes('class')).toContain('rose');
  });

  it('debe renderizar con animación fade-in', () => {
    const wrapper = mountModal();
    const modal = wrapper.find('.relative.bg-white');
    
    expect(modal.attributes('class')).toContain('animate-fade-in');
  });
});
