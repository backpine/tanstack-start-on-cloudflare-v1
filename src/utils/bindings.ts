let cachedEnv: Env | null = null;

// This gets called once at startup
const initDevEnv = async () => {
  if (import.meta.env.DEV) {
    const { getPlatformProxy } = await import("wrangler");
    const proxy = await getPlatformProxy();
    cachedEnv = proxy.env as unknown as Env;
  }
};

initDevEnv();

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
