import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import usePluginImport from "vite-plugin-importer";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    usePluginImport({
      libraryName: "antd",
      libraryDirectory: "es",
      style: true,
    }),
  ],
  resolve: {
    alias: [
      { find: new RegExp("^/@/"), replacement: `${resolve("src")}/` },
      { find: new RegExp("^~"), replacement: "" },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
