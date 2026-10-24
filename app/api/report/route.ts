import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const name = String(data.name ?? "").trim();
    const contact = String(data.contact ?? "").trim();
    const category = String(data.category ?? "").trim();
    const description = String(data.description ?? "").trim();
    const location = String(data.location ?? "").trim();
    if (String(data.website ?? "").trim()) return NextResponse.json({ ok: true });
    if (name.length < 2 || name.length > 100 || contact.length > 160 || location.length > 180 || description.length < 10 || description.length > 3000 || !["Kalsada", "Basura", "Ilaw", "Tubig", "Kaligtasan", "Iba pa"].includes(category)) {
      return NextResponse.json({ error: "Pakisuri ang mga detalye. Kailangan ng hindi bababa sa 10 karakter ang paglalarawan." }, { status: 400 });
    }
    const { reports } = await getCollections();
    await reports.insertOne({ name, contact, category, description, location, status: "Natanggap", created_at: new Date() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hindi naipadala ang report. Pakisubukan muli mamaya." }, { status: 503 });
  }
}
