import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Hindi awtorisado." }, { status: 401 });
  try {
    const { announcements: announcementCollection, reports: reportCollection } = await getCollections();
    const [announcementRows, reportRows] = await Promise.all([
      announcementCollection.find().sort({ published_at: -1 }).limit(100).toArray(),
      reportCollection.find().sort({ created_at: -1 }).limit(200).toArray(),
    ]);
    const announcements = announcementRows.map((item) => ({ ...item, id: item._id!.toHexString(), _id: undefined, published_at: item.published_at.toISOString() }));
    const reports = reportRows.map((item) => ({ ...item, id: item._id!.toHexString(), _id: undefined, created_at: item.created_at.toISOString() }));
    return NextResponse.json({ announcements, reports });
  } catch { return NextResponse.json({ error: "Hindi makakonekta sa database." }, { status: 503 }); }
}
