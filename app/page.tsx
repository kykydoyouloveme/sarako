import Home from "@/components/Home";
import { getCollections } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export default async function Page() {
  let announcements: { id: string; title: string; category: string; body: string; published_at: string }[] = [];
  try {
    const { announcements: collection, jobPosts } = await getCollections();
    const [rows, approvedJobs] = await Promise.all([
      collection.find({ is_published: true }).sort({ published_at: -1 }).limit(3).toArray(),
      jobPosts.find({ is_published: true, status: "Approved" }).sort({ published_at: -1 }).limit(3).toArray(),
    ]);
    announcements = [
      ...rows.map((row) => ({ id: row._id!.toHexString(), title: row.title, category: row.category, body: row.body, published_at: row.published_at.toISOString() })),
      ...approvedJobs.map((job) => ({ id: job._id!.toHexString(), title: job.title, category: job.category, body: `${job.employer} · ${job.location}\nKontak: ${job.contact}\n${job.body}`, published_at: job.published_at.toISOString() })),
    ].sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, 3);
  } catch { /* The public landing page remains visible while database setup is pending. */ }
  return <Home announcements={announcements} />;
}
