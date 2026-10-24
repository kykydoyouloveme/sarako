import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;
    const secondUser = process.env.ADMIN_USERNAME_2;
    const secondPass = process.env.ADMIN_PASSWORD_2;
    const authSecret = process.env.AUTH_SECRET;
    const secondAccountPartiallyConfigured = Boolean(secondUser) !== Boolean(secondPass);
    if (!expectedUser || !expectedPass || expectedPass.length < 14 || secondAccountPartiallyConfigured || (secondPass && secondPass.length < 14) || (secondUser && secondUser === expectedUser) || !authSecret || authSecret.length < 32) {
      return NextResponse.json({ error: "Hindi pa naka-configure nang ligtas ang admin login." }, { status: 503 });
    }
    const accounts = [{ username: expectedUser, password: expectedPass }, ...(secondUser && secondPass ? [{ username: secondUser, password: secondPass }] : [])];
    if (typeof username !== "string" || typeof password !== "string" || !accounts.some((account) => username === account.username && password === account.password)) {
      return NextResponse.json({ error: "Mali ang username o password." }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hindi ma-verify ang admin. Suriin ang server configuration." }, { status: 503 });
  }
}
