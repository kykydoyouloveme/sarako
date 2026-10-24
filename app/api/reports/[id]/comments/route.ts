import { NextResponse } from "next/server";
import { getCollections, ObjectId } from "@/lib/mongodb";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Hindi wastong report." }, { status: 400 });

    const data = await request.json();
    const name = String(data.name ?? "").trim() || "Mamamayan";
    const body = String(data.body ?? "").trim();
    if (name.length > 80 || body.length < 2 || body.length > 1000) {
      return NextResponse.json({ error: "Ilagay ang comment (2 hanggang 1,000 karakter)." }, { status: 400 });
    }

    const comment = { name, body, created_at: new Date() };
    const { reports } = await getCollections();
    const result = await reports.updateOne(
      { _id: new ObjectId(id), is_approved: true },
      { $push: { comments: comment } },
    );
    if (!result.matchedCount) return NextResponse.json({ error: "Hindi makita ang aprubadong report." }, { status: 404 });
    return NextResponse.json({ ok: true, comment: { ...comment, created_at: comment.created_at.toISOString() } });
  } catch {
    return NextResponse.json({ error: "Hindi naipadala ang comment. Pakisubukan muli." }, { status: 503 });
  }
}
