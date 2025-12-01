import { describe, it, expect } from 'vitest';
import { createI18n } from 'vue-i18n';
import es from '../locales/es';
import en from '../locales/en';

describe('i18n Configuration', () => {
  it('debe crear una instancia de i18n correctamente', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    expect(i18n).toBeDefined();
    expect(i18n.global).toBeDefined();
  });

  it('debe tener español como idioma por defecto', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    expect(i18n.global.locale.value).toBe('es');
  });

  it('debe tener inglés como idioma de respaldo', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    expect(i18n.global.fallbackLocale.value).toBe('en');
  });

  it('debe cargar las traducciones en español', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    expect(i18n.global.messages.value.es).toBeDefined();
    expect(i18n.global.messages.value.es).toHaveProperty('nav');
    expect(i18n.global.messages.value.es).toHaveProperty('tasks');
    expect(i18n.global.messages.value.es).toHaveProperty('projects');
  });

  it('debe cargar las traducciones en inglés', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    expect(i18n.global.messages.value.en).toBeDefined();
    expect(i18n.global.messages.value.en).toHaveProperty('nav');
    expect(i18n.global.messages.value.en).toHaveProperty('tasks');
    expect(i18n.global.messages.value.en).toHaveProperty('projects');
  });

  it('debe traducir correctamente una clave en español', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    const { t } = i18n.global;
    expect(t('nav.tasks')).toBe(es.nav.tasks);
  });

  it('debe traducir correctamente una clave en inglés', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    const { t } = i18n.global;
    expect(t('nav.tasks')).toBe(en.nav.tasks);
  });

  it('debe cambiar de idioma dinámicamente', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es,
        en,
      },
    });

    const { t, locale } = i18n.global;

    // Verificar español
    expect(t('nav.tasks')).toBe(es.nav.tasks);

    // Cambiar a inglés
    locale.value = 'en';
    expect(t('nav.tasks')).toBe(en.nav.tasks);

    // Cambiar de vuelta a español
    locale.value = 'es';
    expect(t('nav.tasks')).toBe(es.nav.tasks);
  });

  it('debe usar el idioma de respaldo si falta una traducción', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es: {
          existing: 'Existe',
        },
        en: {
          existing: 'Exists',
          missing: 'Missing translation',
        },
      },
    });

    const { t } = i18n.global;
    
    // Debe usar el fallback para claves que no existen en español
    expect(t('missing')).toBe('Missing translation');
  });

  it('debe soportar interpolación de variables', () => {
    const i18n = createI18n({
      legacy: false,
      locale: 'es',
      fallbackLocale: 'en',
      messages: {
        es: {
          greeting: 'Hola {name}',
        },
        en: {
          greeting: 'Hello {name}',
        },
      },
    });

    const { t } = i18n.global;
    expect(t('greeting', { name: 'Juan' })).toBe('Hola Juan');
  });

  it('debe tener todas las claves necesarias en español', () => {
    const requiredKeys = ['nav', 'tasks', 'projects', 'tags', 'common'];
    
    requiredKeys.forEach(key => {
      expect(es).toHaveProperty(key);
    });
  });

  it('debe tener todas las claves necesarias en inglés', () => {
    const requiredKeys = ['nav', 'tasks', 'projects', 'tags', 'common'];
    
    requiredKeys.forEach(key => {
      expect(en).toHaveProperty(key);
    });
  });

  it('debe tener la misma estructura en ambos idiomas', () => {
    const esKeys = Object.keys(es);
    const enKeys = Object.keys(en);
    
    expect(esKeys.sort()).toEqual(enKeys.sort());
  });
});
