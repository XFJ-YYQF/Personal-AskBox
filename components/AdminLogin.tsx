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
      <input name="password" type="password" placeholder="管理员密码" required style={{padding:"10px 12px",border:"1px solid rgb(var(--mdui-color-outline-variant))",borderRadius:8,background:"transparent",color:"inherit",font:"inherit",fontSize:"1rem"}} />
      <button type="submit" disabled={busy} style={{padding:"10px 24px",border:0,borderRadius:8,background:"rgb(var(--mdui-color-primary))",color:"rgb(var(--mdui-color-on-primary))",font:"inherit",fontSize:"1rem",cursor:"pointer"}}>{busy ? "登录中…" : "登录"}</button>
      {error ? <p style={{color:"rgb(var(--mdui-color-error,179,38,30))",margin:0}}>{error}</p> : null}
    </form>
  );
}
