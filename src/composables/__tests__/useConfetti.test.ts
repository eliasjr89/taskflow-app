import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useConfetti } from '../useConfetti';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

describe('useConfetti', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe exportar la función fireConfetti', () => {
    const { fireConfetti } = useConfetti();
    expect(fireConfetti).toBeDefined();
    expect(typeof fireConfetti).toBe('function');
  });

  it('debe ejecutar fireConfetti sin errores', () => {
    const { fireConfetti } = useConfetti();
    
    expect(() => {
      fireConfetti();
    }).not.toThrow();
  });

  it('debe llamar a canvas-confetti cuando se ejecuta fireConfetti', async () => {
    const confetti = await import('canvas-confetti');
    const { fireConfetti } = useConfetti();
    
    fireConfetti();
    
    // Verificar que se llamó a la función de confetti
    expect(confetti.default).toHaveBeenCalled();
  });

  it('debe poder ejecutarse múltiples veces', () => {
    const { fireConfetti } = useConfetti();
    
    expect(() => {
      fireConfetti();
      fireConfetti();
      fireConfetti();
    }).not.toThrow();
  });

  it('debe retornar el mismo composable en múltiples llamadas', () => {
    const confetti1 = useConfetti();
    const confetti2 = useConfetti();
    
    expect(confetti1.fireConfetti).toBe(confetti2.fireConfetti);
  });
});
