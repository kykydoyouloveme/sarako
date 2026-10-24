import "server-only";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";

export type AnnouncementDoc = {
  _id?: ObjectId;
  title: string;
  category: string;
  body: string;
  published_at: Date;
  is_published: boolean;
  seed_key?: string;
};

export type ReportDoc = {
  _id?: ObjectId;
  name: string;
  contact: string;
  category: string;
  description: string;
  location: string;
  status: string;
  created_at: Date;
  is_approved: boolean;
  approval_status?: "Pending" | "Approved" | "Declined";
  image?: { data: string; content_type: string; original_name: string };
};

declare global {
  // Reuse the MongoDB connection pool across requests and Next.js hot reloads.
  var _sarakoMongoClient: MongoClient | undefined;
  var _sarakoMongoClientPromise: Promise<MongoClient> | undefined;
}

async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  let client = globalThis._sarakoMongoClient;
  if (!client) {
    client = new MongoClient(uri, { appName: "sarako-city-portal", maxPoolSize: 10, maxIdleTimeMS: 5_000 });
    globalThis._sarakoMongoClient = client;
  }
  if (!globalThis._sarakoMongoClientPromise) {
    globalThis._sarakoMongoClientPromise = client.connect().catch((error) => {
      globalThis._sarakoMongoClientPromise = undefined;
      throw error;
    });
  }

  const connected = await globalThis._sarakoMongoClientPromise;
  return connected.db(process.env.MONGODB_DB || "sarako");
}

let setup: Promise<void> | undefined;
export async function getCollections(): Promise<{
  announcements: Collection<AnnouncementDoc>;
  reports: Collection<ReportDoc>;
}> {
  const db = await getDatabase();
  const announcements = db.collection<AnnouncementDoc>("announcements");
  const reports = db.collection<ReportDoc>("reports");

  if (!setup) {
    setup = (async () => {
      await Promise.all([
        announcements.createIndex({ published_at: -1 }),
        announcements.createIndex({ seed_key: 1 }, { unique: true, sparse: true }),
        reports.createIndex({ created_at: -1 }),
      ]);

      const starters = [
        { seed_key: "welcome", title: "Maligayang pagdating sa SARAKO", category: "Anunsyo", body: "Dito matatagpuan ang mga serbisyo, anunsyo, at paraan para makipag-ugnayan sa inyong lungsod." },
        { seed_key: "community", title: "Mga programa para sa komunidad", category: "Komunidad", body: "Bisitahin ang inyong barangay o tanggapan ng lungsod para sa detalye ng mga kasalukuyang programa." },
        { seed_key: "reporting", title: "Ibahagi ang inyong mga alalahanin", category: "Paalaala", body: "Gamitin ang online report form para maiparating sa kinauukulang tanggapan ang mga isyu sa komunidad." },
      ];
      for (const item of starters) {
        await announcements.updateOne(
          { seed_key: item.seed_key },
          { $setOnInsert: { ...item, published_at: new Date(), is_published: true } },
          { upsert: true },
        );
      }
    })().catch((error) => { setup = undefined; throw error; });
  }
  await setup;
  return { announcements, reports };
}

export { ObjectId };
