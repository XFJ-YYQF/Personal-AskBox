import Link from "next/link";
import { siteName } from "@/lib/env";

export function Header({ admin = false }: { admin?: boolean }) {
  return (
    <header className="shell topbar">
      <Link href="/" className="brand">
        <span className="brand-mark">问</span>
        <span>{siteName()}</span>
      </Link>
      {admin ? (
        <form action="/api/admin/logout" method="post">
          <mdui-button variant="text" type="submit">退出</mdui-button>
        </form>
      ) : (
        <Link href="/admin">
          <mdui-button-icon icon="admin_panel_settings" aria-label="管理后台" />
        </Link>
      )}
    </header>
  );
}
