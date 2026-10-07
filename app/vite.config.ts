import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { hubApi } from './server/api';

// Raiz do hub = pasta acima de app/ (os dados ficam em companies/).
process.env.HUB_ROOT ??= fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss(), hubApi()],
  server: { port: 5173, open: !process.env.HUB_NO_OPEN },
  preview: { port: 5173, open: !process.env.HUB_NO_OPEN },
  build: { chunkSizeWarningLimit: 1500 },
});
