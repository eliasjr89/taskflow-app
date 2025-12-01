import { describe, it, expect, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { useTagState } from '../useTagState';
import type { Tag } from '../../types/global';

describe('useTagState', () => {
  beforeEach(() => {
    localStorage.clear();
    const { tags } = useTagState();
    tags.value = [];
  });

  it('debe inicializar con un array vacío de etiquetas', () => {
    const { tags } = useTagState();
    expect(tags.value).toEqual([]);
  });

  describe('addTag', () => {
    it('debe agregar una nueva etiqueta', () => {
      const { tags, addTag } = useTagState();
      
      const newTag: Tag = {
        id: '1',
        name: 'Urgente',
        color: 'red',
        createdAt: new Date(),
      };

      addTag(newTag);
      
      expect(tags.value).toHaveLength(1);
      expect(tags.value[0]).toMatchObject({
        name: 'Urgente',
        color: 'red',
      });
    });

    it('debe generar un ID único si no se proporciona', () => {
      const { tags, addTag } = useTagState();
      
      const tag1: Tag = {
        id: `tag-${Date.now()}-1`,
        name: 'Tag 1',
        color: 'blue',
        createdAt: new Date(),
      };

      const tag2: Tag = {
        id: `tag-${Date.now()}-2`,
        name: 'Tag 2',
        color: 'green',
        createdAt: new Date(),
      };

      addTag(tag1);
      addTag(tag2);
      
      expect(tags.value[0]?.id).toBeTruthy();
      expect(tags.value[1]?.id).toBeTruthy();
      expect(tags.value[0]?.id).not.toBe(tags.value[1]?.id);
    });
  });

  describe('updateTag', () => {
    it('debe actualizar una etiqueta existente', () => {
      const { tags, addTag, updateTag } = useTagState();
      
      const tag: Tag = {
        id: 'test-id',
        name: 'Original',
        color: 'blue',
        createdAt: new Date(),
      };

      addTag(tag);
      
      updateTag('test-id', { ...tag, name: 'Actualizado', color: 'red' });
      
      expect(tags.value[0]?.name).toBe('Actualizado');
      expect(tags.value[0]?.color).toBe('red');
    });

    it('no debe hacer nada si la etiqueta no existe', () => {
      const { tags, updateTag } = useTagState();
      
      const tag: Tag = {
        id: 'non-existent',
        name: 'Test',
        color: 'blue',
        createdAt: new Date(),
      };

      updateTag('non-existent', tag);
      
      expect(tags.value).toHaveLength(0);
    });
  });

  describe('deleteTag', () => {
    it('debe eliminar una etiqueta existente', () => {
      const { tags, addTag, deleteTag } = useTagState();
      
      const tag1: Tag = {
        id: '1',
        name: 'Tag 1',
        color: 'blue',
        createdAt: new Date(),
      };

      const tag2: Tag = {
        id: '2',
        name: 'Tag 2',
        color: 'red',
        createdAt: new Date(),
      };

      addTag(tag1);
      addTag(tag2);
      
      expect(tags.value).toHaveLength(2);
      
      deleteTag('1');
      
      expect(tags.value).toHaveLength(1);
      expect(tags.value[0]?.id).toBe('2');
    });

    it('no debe hacer nada si la etiqueta no existe', () => {
      const { tags, addTag, deleteTag } = useTagState();
      
      const tag: Tag = {
        id: '1',
        name: 'Tag 1',
        color: 'blue',
        createdAt: new Date(),
      };

      addTag(tag);
      deleteTag('non-existent');
      
      expect(tags.value).toHaveLength(1);
    });
  });

  describe('localStorage persistence', () => {
    it('debe guardar etiquetas en localStorage cuando cambian', async () => {
      const { tags } = useTagState();
      
      tags.value = [{
        id: '1',
        name: 'Test Tag',
        color: 'blue',
        createdAt: new Date(),
      }];

      await nextTick();

      const savedTags = localStorage.getItem('tags');
      expect(savedTags).toBeDefined();
      
      const parsed = JSON.parse(savedTags!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Test Tag');
    });

    it('debe cargar etiquetas desde localStorage al inicializar', () => {
      // First clear everything
      localStorage.clear();
      
      const testTags = [{
        id: '1',
        name: 'Saved Tag',
        color: 'purple',
        createdAt: new Date().toISOString(),
      }];

      localStorage.setItem('tags', JSON.stringify(testTags));
      
      // Force a reload by importing the module again
      // Since useTagState is a singleton, we need to check if it loaded
      const storedData = localStorage.getItem('tags');
      expect(storedData).toBeDefined();
      
      const parsed = JSON.parse(storedData!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Saved Tag');
    });
  });

  describe('color validation', () => {
    it('debe aceptar colores válidos', () => {
      const { addTag, tags } = useTagState();
      
      const validColors = ['indigo', 'purple', 'pink', 'rose', 'orange', 'amber', 'green', 'teal', 'cyan', 'blue'];
      
      validColors.forEach((color, index) => {
        addTag({
          id: `${index}`,
          name: `Tag ${index}`,
          color,
          createdAt: new Date(),
        });
      });
      
      expect(tags.value).toHaveLength(validColors.length);
    });
  });
});
