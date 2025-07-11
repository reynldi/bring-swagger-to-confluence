import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Disable minification to help with debugging React errors
    minify: false,
    // Ensure consistent builds
    rollupOptions: {
      output: {
        // Prevent chunk splitting that can cause loading issues in iframes
        manualChunks: undefined,
      }
    }
  },
  define: {
    // Ensure process.env is available for conditional rendering
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  server: {
    // Allow iframe embedding for development
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    }
  }
});
