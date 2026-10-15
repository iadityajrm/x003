import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { neonApiPlugin } from './src/plugins/viteNeonPlugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), neonApiPlugin()],
  server: {
    port: 3000,
    host: true,
  },
});
