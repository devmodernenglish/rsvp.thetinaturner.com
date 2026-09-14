// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://tina-turner-birthday.chris-df1.workers.dev',
  adapter: cloudflare(),
  build: {
    // Inline all component CSS into the HTML so it isn't a render-blocking request
    inlineStylesheets: 'always',
  },
});