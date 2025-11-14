import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force pdfjs to use the legacy build (no eval)
      "pdfjs-dist/build/pdf": "pdfjs-dist/legacy/build/pdf",
      "pdfjs-dist/build/pdf.worker": "pdfjs-dist/legacy/build/pdf.worker",
    },
  },
  build: {
    // Raise the warning threshold (optional)
    chunkSizeWarningLimit: 2000,

    rollupOptions: {
      output: {
        // Code-split big libraries into separate chunks
        manualChunks: {
          react: ["react", "react-dom"],
          pdf: ["react-pdf", "pdfjs-dist"],
        },
      },
    },
  },
});
