import { useEffect, useState } from 'react';
import { LiteState } from '@/reactive';

export function useLiteState<T>(state: LiteState<T>) {
  const [value, setValue] = useState<T>(state.get());

  useEffect(() => {
    const unsubscribe = state.subscribe((value) => {
      setValue(value);
    });

    return () => {
      unsubscribe();
    };
  }, [state]);

  return value;
}
