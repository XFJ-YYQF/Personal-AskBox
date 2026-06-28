import { getCloudflareEnv } from "./cloudflare";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function saveAttachment(file: File | null, id: string) {
  if (!file || file.size === 0) return null;
  if (file.size > 4 * 1024 * 1024) throw new Error("附件不能超过 4MB。");
  if (!allowedTypes.has(file.type)) throw new Error("附件仅支持 PNG、JPG、WEBP 或 GIF。");

  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) {
    throw new Error("R2 binding is not configured for attachment uploads.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const key = `questions/${id}.${extension}`;
  await env.ASKBOX_R2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name }
  });
  return key;
}

export async function deleteAttachment(key: string | null) {
  if (!key) return;
  const env = await getCloudflareEnv();
  if (!env.ASKBOX_R2) return;
  await env.ASKBOX_R2.delete(key);
}
