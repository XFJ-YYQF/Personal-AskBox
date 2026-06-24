import { getCloudflareEnv } from "./cloudflare";
import { getEnv } from "./env";

export async function verifyTurnstile(token: string | null, ip?: string | null) {
  const env = await getCloudflareEnv();
  const secret = env.TURNSTILE_SECRET_KEY ?? getEnv("TURNSTILE_SECRET_KEY");
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token) return false;

  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body
  });
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}
