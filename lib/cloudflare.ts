import type { CloudflareEnv } from "./env";

export async function getCloudflareEnv(): Promise<CloudflareEnv> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = await mod.getCloudflareContext({ async: true });
    return (context?.env ?? {}) as CloudflareEnv;
  } catch {
    return {};
  }
}
