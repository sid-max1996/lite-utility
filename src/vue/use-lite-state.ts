import { ref, onBeforeUnmount, Ref } from 'vue';
import { LiteState } from '@/reactive';

export function useLiteState<T>(state: LiteState<T>) {
  const data = ref(state.get()) as Ref<T>;

  const unsubscribe = state.subscribe((value) => {
    data.value = value;
  });

  onBeforeUnmount(unsubscribe);

  return data;
}
