import { TermsContent, LAST_UPDATED } from "@/components/Legal";

export default function TermsPage() {
  return (
    <main className="shell" style={{ padding: "32px 0 64px", maxWidth: 800, lineHeight: 1.8 }}>
      <h1>用户协议</h1>
      <p style={{ color: "rgb(var(--mdui-color-on-surface-variant))" }}>最后更新日期：{LAST_UPDATED}</p>
      <TermsContent />
    </main>
  );
}
