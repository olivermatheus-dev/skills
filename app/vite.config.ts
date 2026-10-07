import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { hubApi } from './server/api';

// Raiz do hub = pasta acima de app/ (os dados ficam em companies/).
process.env.HUB_ROOT ??= new URL('..', import.meta.url).pathname.replace(/\/$/, '');

export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  plugins: [react(), tailwindcss(), hubApi()],
  server: { port: 5173, open: !process.env.HUB_NO_OPEN },
});
