import { redirect } from "next/navigation";
import { AdminInbox } from "@/components/AdminInbox";
import { AdminLogin } from "@/components/AdminLogin";
import { Header } from "@/components/Header";
import { isAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const ok = await isAdmin();
  if (!ok) {
    return (
      <>
        <Header />
        <main className="shell">
          <section className="hero">
            <div>
              <h1 className="headline">管理后台</h1>
              <p className="lede">登录后查看匿名问题并发布回答。</p>
            </div>
            <AdminLogin />
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header admin />
      <main className="shell">
        <AdminInbox />
      </main>
    </>
  );
}
