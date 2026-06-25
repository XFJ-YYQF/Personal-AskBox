import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }
  const cookie = await createSessionCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("askbox_session", cookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
