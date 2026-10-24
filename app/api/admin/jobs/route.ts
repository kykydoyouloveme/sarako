import { NextResponse } from "next/server";
import { getCollections, ObjectId } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Hindi awtorisado." }, { status: 401 });
  try {
    const data = await request.json();
    const id = String(data.id ?? "");
    const decision = String(data.decision ?? "");
    if (!/^[a-f\d]{24}$/i.test(id) || !["approve", "decline"].includes(decision)) {
      return NextResponse.json({ error: "Hindi wastong update." }, { status: 400 });
    }
    const approved = decision === "approve";
    const { jobPosts } = await getCollections();
    const result = await jobPosts.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: approved ? "Approved" : "Declined", is_published: approved, ...(approved ? { published_at: new Date() } : {}) } },
    );
    if (!result.matchedCount) return NextResponse.json({ error: "Hindi makita ang alok na trabaho." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hindi na-update ang alok na trabaho." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Hindi awtorisado." }, { status: 401 });
  try {
    const data = await request.json();
    const id = String(data.id ?? "");
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Hindi wastong ID." }, { status: 400 });
    const { jobPosts } = await getCollections();
    const result = await jobPosts.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return NextResponse.json({ error: "Hindi makita ang alok na trabaho." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hindi nabura ang alok na trabaho." }, { status: 503 });
  }
}
