import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const employer = String(data.employer ?? "").trim();
    const contact = String(data.contact ?? "").trim();
    const location = String(data.location ?? "").trim();
    const body = String(data.body ?? "").trim();

    if (employer.length < 2 || employer.length > 120 || contact.length < 5 || contact.length > 160 || location.length < 2 || location.length > 180 || body.length < 20 || body.length > 3000) {
      return NextResponse.json({ error: "Pakisuri ang form. Siguraduhing kumpleto at nasa tamang haba ang bawat detalye." }, { status: 400 });
    }

    const { jobPosts } = await getCollections();
    await jobPosts.insertOne({
      employer, contact, title: employer, location, body, category: "Trabaho",
      status: "Pending", is_published: false, published_at: new Date(), created_at: new Date(),
    });
    return NextResponse.json({ ok: true, message: "Natanggap ang alok na trabaho. Lalabas ito sa Balita at Anunsyo kapag naaprubahan ng admin." });
  } catch {
    return NextResponse.json({ error: "Hindi naipadala ang alok na trabaho. Pakisubukan muli mamaya." }, { status: 503 });
  }
}
