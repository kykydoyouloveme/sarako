import { NextResponse } from "next/server";
import { getCollections, ObjectId } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const data = await request.json(); const id = String(data.id ?? ""); const status = String(data.status ?? "");
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid report update." }, { status: 400 });
    const { reports } = await getCollections();
    if (typeof data.approved === "boolean") {
      await reports.updateOne({ _id: new ObjectId(id) }, { $set: { is_approved: data.approved, approval_status: data.approved ? "Approved" : "Pending" } });
    } else if (["approve", "decline"].includes(String(data.decision ?? ""))) {
      const approved = data.decision === "approve";
      await reports.updateOne({ _id: new ObjectId(id) }, { $set: { is_approved: approved, approval_status: approved ? "Approved" : "Declined" } });
    } else if (["Natanggap", "Sinusuri", "Aksyon", "Tapos na"].includes(status)) {
      await reports.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    } else {
      return NextResponse.json({ error: "Invalid report update." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update the report." }, { status: 503 }); }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const data = await request.json(); const id = String(data.id ?? "");
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid report." }, { status: 400 });
    const { reports } = await getCollections();
    const result = await reports.deleteOne({
      _id: new ObjectId(id),
      $or: [{ approval_status: "Declined" }, { status: "Tapos na" }],
    });
    if (!result.deletedCount) return NextResponse.json({ error: "Only declined or completed reports can be deleted." }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to delete the report." }, { status: 503 }); }
}
