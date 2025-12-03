import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TaskDetailModal from '../TaskDetailModal.vue';
import { createTestI18n } from './testHelpers';

describe('TaskDetailModal', () => {
  const i18n = createTestI18n();
  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    priority: 'medium' as const,
    tags: ['1'],
    projectId: '1'
  };

  it('renders correctly when open', () => {
    const wrapper = mount(TaskDetailModal, {
      props: {
        task: mockTask,
        isOpen: true
      },
      global: {
        plugins: [i18n]
      }
    });

    expect((wrapper.find('input[type="text"]').element as HTMLInputElement).value).toBe('Test Task');
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('Test Description');
  });

  it('does not render when closed', () => {
    const wrapper = mount(TaskDetailModal, {
      props: {
        task: mockTask,
        isOpen: false
      },
      global: {
        plugins: [i18n]
      }
    });

    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('emits close event when clicking close button', async () => {
    const wrapper = mount(TaskDetailModal, {
      props: {
        task: mockTask,
        isOpen: true
      },
      global: {
        plugins: [i18n]
      }
    });

    // Click the backdrop to trigger close event
    await wrapper.find('.absolute.inset-0').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
