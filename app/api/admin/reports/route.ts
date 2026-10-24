import { NextResponse } from "next/server";
import { getCollections, ObjectId } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Hindi awtorisado." }, { status: 401 });
  try {
    const data = await request.json(); const id = String(data.id ?? ""); const status = String(data.status ?? "");
    if (!/^[a-f\d]{24}$/i.test(id) || !["Natanggap", "Sinusuri", "Aksyon", "Tapos na"].includes(status)) return NextResponse.json({ error: "Hindi wastong update." }, { status: 400 });
    const { reports } = await getCollections();
    await reports.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Hindi na-update ang report." }, { status: 503 }); }
}
