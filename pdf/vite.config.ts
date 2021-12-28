import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { builtinModules } from 'module';
import { dependencies } from '../package.json'

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      { find: new RegExp("^/@/"), replacement: `${resolve("src")}/` },
    ],
  },
  root: __dirname,
  build: {
    lib: {
      entry: 'src/resume.tsx',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [...Object.keys(dependencies), ...builtinModules],
      output: {
        entryFileNames: 'index.js',
      },
    },
    minify: false,
  }
});
