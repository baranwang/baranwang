import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { minifyHtml, injectHtml } from 'vite-plugin-html'
import usePluginImport from "vite-plugin-importer";
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from "path";
import { title, description } from './src/config'

export default defineConfig({
  plugins: [
    react(),
    minifyHtml(),
    injectHtml({
      data: {
        title,
        description
      }
    }),
    usePluginImport({
      libraryName: "antd",
      libraryDirectory: "es",
      style: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        lang: 'zh-Hans',
      }
    })
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
