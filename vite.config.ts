import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    eslint(),
    dts({
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: './dist',
    lib: {
      entry: {
        index: resolve(__dirname, './src/index.ts'),
        function: resolve(__dirname, './src/function/index.ts'),
        reactive: resolve(__dirname, './src/reactive/index.ts'),
        services: resolve(__dirname, './src/services/index.ts'),
        logging: resolve(__dirname, './src/logging/index.ts'),
        browser: resolve(__dirname, './src/browser/index.ts'),
        react: resolve(__dirname, './src/react/index.ts'),
        timers: resolve(__dirname, './src/timers/index.ts'),
        vue: resolve(__dirname, './src/vue/index.ts'),
        frequency: resolve(__dirname, './src/frequency/index.ts'),
      },
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${extension}`;
      },
    },
    rollupOptions: {
      external: ['react', 'vue'],
    },
  },
});
