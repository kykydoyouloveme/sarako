import Home from "@/components/Home";
import { getCollections } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export default async function Page() {
  let announcements: { id: string; title: string; category: string; body: string; published_at: string }[] = [];
  try {
    const { announcements: collection } = await getCollections();
    const rows = await collection.find({ is_published: true }).sort({ published_at: -1 }).limit(3).toArray();
    announcements = rows.map((row) => ({ id: row._id!.toHexString(), title: row.title, category: row.category, body: row.body, published_at: row.published_at.toISOString() }));
  } catch { /* The public landing page remains visible while database setup is pending. */ }
  return <Home announcements={announcements} />;
}
