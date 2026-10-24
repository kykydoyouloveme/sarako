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
    const reports = reportRows.map((item) => ({
      id: item._id!.toHexString(), name: item.name, contact: item.contact, category: item.category,
      description: item.description, location: item.location, status: item.status,
      created_at: item.created_at.toISOString(), is_approved: Boolean(item.is_approved), has_photo: Boolean(item.image?.data),
    }));
    return NextResponse.json({ announcements, reports });
  } catch { return NextResponse.json({ error: "Hindi makakonekta sa database." }, { status: 503 }); }
}
