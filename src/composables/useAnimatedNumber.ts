import { ref, watch, onMounted, unref, type Ref } from 'vue';

type MaybeRefOrGetter<T> = T | Ref<T> | (() => T);

export function useAnimatedNumber(target: MaybeRefOrGetter<number>, duration: number = 1500) {
  const current = ref(0);

  const resolveValue = (): number => {
    if (typeof target === 'function') {
      return (target as () => number)();
    }
    return unref(target);
  };

  const animate = () => {
    const start = 0;
    const end = resolveValue();
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      current.value = Math.floor(start + (end - start) * ease);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        current.value = end;
      }
    };

    requestAnimationFrame(update);
  };

  onMounted(() => {
    animate();
  });

  watch(() => resolveValue(), () => {
    animate();
  });

  return current;
}
