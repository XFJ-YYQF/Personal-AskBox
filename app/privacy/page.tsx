import { PrivacyContent, LAST_UPDATED } from "@/components/Legal";

export default function PrivacyPage() {
  return (
    <main className="shell" style={{ padding: "32px 0 64px", maxWidth: 800, lineHeight: 1.8 }}>
      <h1>隐私政策</h1>
      <p style={{ color: "rgb(var(--mdui-color-on-surface-variant))" }}>最后更新日期：{LAST_UPDATED}</p>
      <PrivacyContent />
    </main>
  );
}
