import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { announcements: announcementCollection, reports: reportCollection, jobPosts: jobPostCollection } = await getCollections();
    const [announcementRows, reportRows, jobPostRows] = await Promise.all([
      announcementCollection.find().sort({ published_at: -1 }).limit(100).toArray(),
      reportCollection.find().sort({ created_at: -1 }).limit(200).toArray(),
      jobPostCollection.find().sort({ created_at: -1 }).limit(200).toArray(),
    ]);
    const announcements = announcementRows.map((item) => ({ ...item, id: item._id!.toHexString(), _id: undefined, published_at: item.published_at.toISOString() }));
    const reports = reportRows.map((item) => ({
      id: item._id!.toHexString(), name: item.name, contact: item.contact, category: item.category,
      description: item.description, location: item.location, status: item.status,
      created_at: item.created_at.toISOString(), is_approved: Boolean(item.is_approved),
      approval_status: item.approval_status ?? (item.is_approved ? "Approved" : "Pending"), has_photo: Boolean(item.image?.data),
    }));
    const jobPosts = jobPostRows.map((item) => ({
      id: item._id!.toHexString(), employer: item.employer, contact: item.contact,
      title: item.title, category: item.category, body: item.body, location: item.location,
      status: item.status, created_at: item.created_at.toISOString(), is_published: item.is_published,
    }));
    return NextResponse.json({ announcements, reports, jobPosts });
  } catch { return NextResponse.json({ error: "Unable to connect to the database." }, { status: 503 }); }
}
