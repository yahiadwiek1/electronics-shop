import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/yahia_290/' // مهم للنشر على GitHub Pages
});
