import { NextResponse } from "next/server";
import { getCollections } from "@/lib/mongodb";

export const runtime = "nodejs";
const maxImageBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const category = String(data.get("category") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const photoComment = String(data.get("photo_comment") ?? "").trim();
    const location = String(data.get("location") ?? "").trim();
    if (String(data.get("website") ?? "").trim()) return NextResponse.json({ ok: true });
    if (name.length < 2 || name.length > 100 || contact.length > 160 || location.length < 3 || location.length > 180 || description.length < 10 || description.length > 3000 || photoComment.length > 500 || !["Kalsada", "Basura", "Ilaw", "Tubig", "Kaligtasan", "Iba pa"].includes(category)) {
      return NextResponse.json({ error: "Pakisuri ang pangalan, lokasyon, kategorya, at paglalarawan. Dapat hindi bababa sa 10 karakter ang paglalarawan." }, { status: 400 });
    }
    const photo = data.get("photo");
    if (!(photo instanceof File) || photo.size === 0) return NextResponse.json({ error: "Mag-attach ng larawan para maipadala ang report." }, { status: 400 });
    if (photo.size > maxImageBytes) return NextResponse.json({ error: "Hanggang 4 MB lang ang laki ng larawan." }, { status: 413 });
    const contentType = photo.type.toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) return NextResponse.json({ error: "JPG, PNG, o WebP na larawan lang ang puwedeng i-upload." }, { status: 400 });
    const imageBytes = Buffer.from(await photo.arrayBuffer());
    const isJpeg = contentType === "image/jpeg" && imageBytes[0] === 0xff && imageBytes[1] === 0xd8 && imageBytes[2] === 0xff;
    const isPng = contentType === "image/png" && imageBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = contentType === "image/webp" && imageBytes.toString("ascii", 0, 4) === "RIFF" && imageBytes.toString("ascii", 8, 12) === "WEBP";
    if (!isJpeg && !isPng && !isWebp) return NextResponse.json({ error: "Hindi tugma ang file sa napiling uri ng larawan." }, { status: 400 });
    const { reports } = await getCollections();
    await reports.insertOne({
      name, contact, category, description, photo_comment: photoComment, location, status: "Natanggap", is_approved: false, approval_status: "Pending", created_at: new Date(),
      image: { data: imageBytes.toString("base64"), content_type: contentType, original_name: photo.name.slice(0, 120) },
    });
    return NextResponse.json({ ok: true, message: "Natanggap ang report at lalabas lang ito sa publiko kapag naaprubahan ng admin." });
  } catch {
    return NextResponse.json({ error: "Hindi naipadala ang report. Pakisubukan muli mamaya." }, { status: 503 });
  }
}
