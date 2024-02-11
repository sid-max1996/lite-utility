import { ref, onMounted } from 'vue';

export function useWindowSizes() {
  const getWindowSizes = () => {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  };
  const sizes = ref(getWindowSizes());

  onMounted(() => {
    const changeWindowSizes = () => {
      sizes.value = getWindowSizes();
    };
    window.addEventListener('resize', changeWindowSizes);

    return () => {
      window.removeEventListener('resize', changeWindowSizes);
    };
  });

  return sizes;
}
