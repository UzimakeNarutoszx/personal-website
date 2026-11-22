import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({ site: 'https://jianwen.xin/personal/', base: '/personal', integrations: [react()], output: 'static', devToolbar: { enabled: false } });
