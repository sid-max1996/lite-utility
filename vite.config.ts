import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    eslint(),
    dts({
      outDir: 'dist',
    }),
  ],
  build: {
    outDir: './dist',
    lib: {
      entry: {
        index: resolve(__dirname, './src/index.ts'),
        function: resolve(__dirname, './src/function/index.ts'),
        reactive: resolve(__dirname, './src/reactive/index.ts'),
      },
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${extension}`;
      },
    },
  },
});
