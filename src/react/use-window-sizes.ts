import { useEffect, useState } from 'react';

export function useWindowSizes() {
  const getWindowSizes = () => {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  };
  const [value, setValue] = useState(getWindowSizes());

  useEffect(() => {
    const changeWindowSizes = () => {
      setValue(getWindowSizes());
    };
    window.addEventListener('resize', changeWindowSizes);

    return () => {
      window.removeEventListener('resize', changeWindowSizes);
    };
  }, []);

  return value;
}
