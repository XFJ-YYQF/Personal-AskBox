"use client";
import { useState } from "react";

export function AdminLogin() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: form
    });
    if (response.ok) {
      window.location.href = "/admin";
      return;
    }
    const data = await response.json().catch(() => null) as { error?: string } | null;
    setBusy(false);
    setError(data?.error ?? "密码错误");
  }

  return (
    <form className="panel form-stack" onSubmit={submit}>
      <mdui-text-field name="password" type="password" label="管理员密码" required />
      <mdui-button type="submit" loading={busy || undefined}>
        {busy ? "登录中…" : "登录"}
      </mdui-button>
      {error ? <p style={{color:"rgb(var(--mdui-color-error,179,38,30))",margin:0}}>{error}</p> : null}
    </form>
  );
}
