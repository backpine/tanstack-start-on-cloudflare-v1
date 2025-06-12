# TanStack Start Beta on Cloudflare

This project demonstrates how to get TanStack Start Beta running on Cloudflare. The transition from Alpha to Beta has made it significantly easier to deploy on Cloudflare infrastructure.

## Setup

This repo was set up following the [TanStack Start Quick Start guide](https://tanstack.com/start/latest/docs/framework/react/quick-start).

## Configuration

### 1. Vite Configuration

Configure your `vite.config.ts` to use the `cloudflare-module` target for a compatible build:

```ts
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      target: "cloudflare-module", // Key configuration for Cloudflare compatibility
    }),
  ],
});
```

### 2. Bindings Helper

Set up a bindings helper utility to access Cloudflare bindings in both development and production:

```ts
let cachedEnv: Env | null = null;

// This gets called once at startup when running locally
const initDevEnv = async () => {
  const { getPlatformProxy } = await import("wrangler");
  const proxy = await getPlatformProxy();
  cachedEnv = proxy.env as unknown as Env;
};

if (import.meta.env.DEV) {
  await initDevEnv();
}

export function getBindings(): Env {
  if (import.meta.env.DEV) {
    if (!cachedEnv) {
      throw new Error(
        "Dev bindings not initialized yet. Call initDevEnv() first.",
      );
    }
    return cachedEnv;
  }

  return process.env as unknown as Env;
}
```

The `getPlatformProxy` function allows you to access Cloudflare bindings when developing locally, providing a seamless development experience.

## Usage

### Accessing Bindings in Server Functions

You can use the bindings helper in your server functions like this:

```tsx
const personServerFn = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: name }) => {
    const env = getBindings();
    let growingAge = Number((await env.CACHE.get("age")) || 0);
    growingAge++;
    await env.CACHE.put("age", growingAge.toString());
    return { name, randomNumber: growingAge };
  });
```

## Environment Handling

- **Development**: Bindings are accessed via `getPlatformProxy()` from Wrangler
- **Production**: Bindings are accessed via `process.env`

Currently, using `process.env as unknown as Env` is the best approach I've found to ensure your bindings are properly typed throughout your project. Looking for a better way to handle this type casting.

## Notes

The Beta version of TanStack Start has significantly improved Cloudflare compatibility compared to the Alpha version, making deployment and development much more straightforward.
