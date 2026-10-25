import { NextResponse } from "next/server";
import { getCollections, ObjectId } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const data = await request.json();
    const id = String(data.id ?? "");
    const decision = String(data.decision ?? "");
    if (!/^[a-f\d]{24}$/i.test(id) || !["approve", "decline"].includes(decision)) {
      return NextResponse.json({ error: "Invalid job post update." }, { status: 400 });
    }
    const approved = decision === "approve";
    const { jobPosts } = await getCollections();
    const result = await jobPosts.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: approved ? "Approved" : "Declined", is_published: approved, ...(approved ? { published_at: new Date() } : {}) } },
    );
    if (!result.matchedCount) return NextResponse.json({ error: "Job post not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update the job post." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const data = await request.json();
    const id = String(data.id ?? "");
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid job post ID." }, { status: 400 });
    const { jobPosts } = await getCollections();
    const result = await jobPosts.deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) return NextResponse.json({ error: "Job post not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete the job post." }, { status: 503 });
  }
}
