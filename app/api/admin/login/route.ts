import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;
    const authSecret = process.env.AUTH_SECRET;
    if (!expectedUser || !expectedPass || expectedPass.length < 14 || !authSecret || authSecret.length < 32) {
      return NextResponse.json({ error: "Hindi pa naka-configure nang ligtas ang admin login." }, { status: 503 });
    }
    if (typeof username !== "string" || typeof password !== "string" || username !== expectedUser || password !== expectedPass) {
      return NextResponse.json({ error: "Mali ang username o password." }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hindi ma-verify ang admin. Suriin ang server configuration." }, { status: 503 });
  }
}
