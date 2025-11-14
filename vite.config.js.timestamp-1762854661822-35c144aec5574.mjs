// vite.config.js
import { defineConfig } from "file:///C:/Rohit/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Rohit/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Force pdfjs to use the legacy build (no eval)
      "pdfjs-dist/build/pdf": "pdfjs-dist/legacy/build/pdf",
      "pdfjs-dist/build/pdf.worker": "pdfjs-dist/legacy/build/pdf.worker"
    }
  },
  build: {
    // Raise the warning threshold (optional)
    chunkSizeWarningLimit: 2e3,
    rollupOptions: {
      output: {
        // Code-split big libraries into separate chunks
        manualChunks: {
          react: ["react", "react-dom"],
          pdf: ["react-pdf", "pdfjs-dist"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxSb2hpdFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcUm9oaXRcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1JvaGl0L2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIC8vIEZvcmNlIHBkZmpzIHRvIHVzZSB0aGUgbGVnYWN5IGJ1aWxkIChubyBldmFsKVxuICAgICAgXCJwZGZqcy1kaXN0L2J1aWxkL3BkZlwiOiBcInBkZmpzLWRpc3QvbGVnYWN5L2J1aWxkL3BkZlwiLFxuICAgICAgXCJwZGZqcy1kaXN0L2J1aWxkL3BkZi53b3JrZXJcIjogXCJwZGZqcy1kaXN0L2xlZ2FjeS9idWlsZC9wZGYud29ya2VyXCIsXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICAvLyBSYWlzZSB0aGUgd2FybmluZyB0aHJlc2hvbGQgKG9wdGlvbmFsKVxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcblxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBDb2RlLXNwbGl0IGJpZyBsaWJyYXJpZXMgaW50byBzZXBhcmF0ZSBjaHVua3NcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgcmVhY3Q6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxuICAgICAgICAgIHBkZjogW1wicmVhY3QtcGRmXCIsIFwicGRmanMtZGlzdFwiXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyTyxTQUFTLG9CQUFvQjtBQUN4USxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBLE1BRUwsd0JBQXdCO0FBQUEsTUFDeEIsK0JBQStCO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQSxJQUVMLHVCQUF1QjtBQUFBLElBRXZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQTtBQUFBLFFBRU4sY0FBYztBQUFBLFVBQ1osT0FBTyxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzVCLEtBQUssQ0FBQyxhQUFhLFlBQVk7QUFBQSxRQUNqQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
