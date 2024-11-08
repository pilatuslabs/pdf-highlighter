import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts()],
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
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "pdfjs-dist",
        "pdfjs-dist/web",
        "debounce",
      ],
    },
  },
});
