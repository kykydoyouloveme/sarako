import { NextResponse } from "next/server";
import { getCollections, ObjectId } from "@/lib/mongodb";
import { isAdmin } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return new NextResponse("Not found", { status: 404 });
    const { reports } = await getCollections();
    const report = await reports.findOne({ _id: new ObjectId(id) });
    if (!report?.image?.data) return new NextResponse("Not found", { status: 404 });
    if (!report.is_approved && !await isAdmin()) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(Uint8Array.from(Buffer.from(report.image.data, "base64")), {
      headers: {
        "Content-Type": report.image.content_type,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Image unavailable", { status: 503 });
  }
}
