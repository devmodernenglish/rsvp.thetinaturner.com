type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals {
    runtime: Runtime;
  }
}

interface Env {
  KLAVIYO_API_KEY: string;
  KLAVIYO_LIST_ID: string;
}
