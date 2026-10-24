import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";

export async function GET() {
  try {
    const { reports } = await getCollections();
    const rows = await reports.find({ is_approved: true }).sort({ created_at: -1 }).limit(60).toArray();
    return NextResponse.json(rows.map((item) => ({
      id: item._id!.toHexString(),
      category: item.category,
      description: item.description,
      photo_comment: item.photo_comment ?? "",
      location: item.location,
      created_at: item.created_at.toISOString(),
      has_photo: Boolean(item.image?.data),
    })));
  } catch {
    return NextResponse.json({ error: "Hindi makakakuha ng mga report sa ngayon." }, { status: 503 });
  }
}
