import { NextResponse } from "next/server";
import { getCollections, ObjectId } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Hindi awtorisado." }, { status: 401 });
  try {
    const data = await request.json();
    const title = String(data.title ?? "").trim(); const category = String(data.category ?? "Anunsyo").trim(); const body = String(data.body ?? "").trim();
    if (title.length < 3 || title.length > 180 || category.length > 60 || body.length < 5 || body.length > 5000) return NextResponse.json({ error: "Pakisuri ang pamagat, kategorya, at nilalaman." }, { status: 400 });
    const { announcements } = await getCollections();
    await announcements.insertOne({ title, category, body, published_at: new Date(), is_published: true });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Hindi naidagdag ang anunsyo." }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Hindi awtorisado." }, { status: 401 });
  try {
    const data = await request.json(); const id = String(data.id ?? ""); const published = Boolean(data.published);
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Hindi wastong ID." }, { status: 400 });
    const { announcements } = await getCollections();
    await announcements.updateOne({ _id: new ObjectId(id) }, { $set: { is_published: published } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Hindi na-update ang anunsyo." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Hindi awtorisado." }, { status: 401 });
  try {
    const data = await request.json(); const id = String(data.id ?? "");
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Hindi wastong ID." }, { status: 400 });
    const { announcements } = await getCollections();
    const result = await announcements.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return NextResponse.json({ error: "Hindi makita ang balita o anunsyo." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Hindi nabura ang balita o anunsyo." }, { status: 503 }); }
}
