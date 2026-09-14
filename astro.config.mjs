// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://rsvp-thetinaturner-com.pages.dev/",
  output: "server", // or 'server'
  adapter: cloudflare(),
  build: {
    // Inline all component CSS into the HTML so it isn't a render-blocking request
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
});
