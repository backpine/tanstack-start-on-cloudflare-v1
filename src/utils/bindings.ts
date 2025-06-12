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
        "Dev bindings not initialized yet. fCall initDevEnv() first.",
      );
    }
    return cachedEnv;
  }

  return process.env as unknown as Env;
}
