import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@pdf-reader": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          return assetInfo.name === "index.css"
            ? "pdf-reader.css"
            : assetInfo.name || "asset-[name]-[hash].[ext]";
        },
      },
    },
  },
});
