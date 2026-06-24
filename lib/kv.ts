import { getCloudflareEnv } from "./cloudflare";
import { getEnv } from "./env";

export async function kvGet(key: string) {
  const env = await getCloudflareEnv();
  if (env.ASKBOX_KV) return env.ASKBOX_KV.get(key);

  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const token = getEnv("CLOUDFLARE_API_TOKEN");
  const namespaceId = getEnv("CLOUDFLARE_KV_NAMESPACE_ID");
  if (!accountId || !token || !namespaceId) return null;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Cloudflare KV read failed");
  return response.text();
}

export async function kvPut(key: string, value: string, expirationTtl?: number) {
  const env = await getCloudflareEnv();
  if (env.ASKBOX_KV) {
    await env.ASKBOX_KV.put(key, value, expirationTtl ? { expirationTtl } : undefined);
    return;
  }

  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const token = getEnv("CLOUDFLARE_API_TOKEN");
  const namespaceId = getEnv("CLOUDFLARE_KV_NAMESPACE_ID");
  if (!accountId || !token || !namespaceId) return;

  const url = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`
  );
  if (expirationTtl) url.searchParams.set("expiration_ttl", String(expirationTtl));

  const response = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: value
  });
  if (!response.ok) throw new Error("Cloudflare KV write failed");
}
