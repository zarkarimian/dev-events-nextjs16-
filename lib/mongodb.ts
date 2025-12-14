import mongoose, { type Mongoose } from "mongoose";

/**
 * Mongoose caches models internally, but Next.js (especially in dev with HMR)
 * can re-run module initialization multiple times. We keep a cached connection
 * on the global object to avoid creating many connections.
 */
interface MongooseGlobalCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseGlobalCache | undefined;
}

const MONGODB_URI: string = (() => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Fail fast with a clear error message instead of trying to connect with an undefined URI.
    throw new Error(
      "Missing MONGODB_URI environment variable. Add it to your .env file.",
    );
  }
  return uri;
})();

const cached: MongooseGlobalCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

// Ensure the cache is attached to the global object (important for dev/HMR).
global.mongoose = cached;

/**
 * Connect to MongoDB and return the Mongoose instance.
 *
 * Usage (server-only):
 *   import connectToDatabase from "@/lib/mongodb";
 *   await connectToDatabase();
 */
export default async function connectToDatabase(): Promise<Mongoose> {
  // Reuse an existing connection if we already have one.
  if (cached.conn) return cached.conn;

  // Reuse the in-flight connection promise if a connection is currently being created.
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
