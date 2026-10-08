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
  // @ = app/src (padrão do shadcn: @/components/ui/…, @/lib/utils)
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // 127.0.0.1 explícito: o padrão "localhost" no Windows escuta só em [::1], e scripts que chamam 127.0.0.1 não achavam o app
  server: { host: '127.0.0.1', port: 5173, open: !process.env.HUB_NO_OPEN },
  preview: { host: '127.0.0.1', port: 5173, open: !process.env.HUB_NO_OPEN },
  build: { chunkSizeWarningLimit: 1500 },
});
