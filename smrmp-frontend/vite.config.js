import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Bind all interfaces so the app is reachable from a phone on the same
    // wifi (needed to test the visitor QR scan flow on a real device).
    host: true,
  },
});
