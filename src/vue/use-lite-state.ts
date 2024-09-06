import { ref, onBeforeUnmount, Ref } from 'vue';
import { IState } from '@/reactive';

export function useLiteState<T>(state: IState<T>) {
  const data = ref(state.get()) as Ref<T>;

  const unsubscribe = state.subscribe((value) => {
    data.value = value;
  });

  onBeforeUnmount(unsubscribe);

  return data;
}
