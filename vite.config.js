import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'src/main.js'),  // Adjusted to point directly to main.js in src folder
      external: [], // Add external dependencies here if necessary
    },
  },
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')  // Allows '@' to act as an alias for 'src' folder
    }
  }
});
