"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        target: string | HTMLElement,
        options: { sitekey: string; callback: (token: string) => void }
      ) => void;
    };
  }
}

export function AskForm({ siteKey }: { siteKey: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !turnstileRef.current || !window.turnstile) return;
      window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: setToken
      });
    };

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.body.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [siteKey]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    form.set("turnstileToken", token);
    if (file) form.set("attachment", file);
    const response = await fetch("/api/questions", {
      method: "POST",
      body: form
    });
    setBusy(false);
    if (response.ok) {
      event.currentTarget.reset();
      setFile(null);
      setMessage("已经投递到收件箱。");
      return;
    }
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setMessage(data?.error ?? "提交失败，请稍后再试。");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <mdui-text-field name="nickname" label="昵称（可留空）" maxlength="40" clearable />
      <mdui-text-field name="content" label="想问什么？" required rows="7" maxlength="1000" counter />
      <label style={{display:"grid",gap:4,fontSize:"var(--mdui-typescale-body-small-font-size,0.875rem)",color:"rgb(var(--mdui-color-on-surface-variant))"}}>
        图片附件（可选）
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{color:"inherit",font:"inherit"}} />
      </label>
      {siteKey ? <div ref={turnstileRef} /> : null}
      <mdui-button type="submit" loading={busy || undefined} full-width>
        发送问题
      </mdui-button>
      {message ? <mdui-card variant="outlined">{message}</mdui-card> : null}
    </form>
  );
}
