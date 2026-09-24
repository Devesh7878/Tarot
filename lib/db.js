import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

const globalCache = globalThis;

globalCache.__mongoose ||= { conn: null, promise: null };

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables.");
  }

  const cached = globalCache.__mongoose;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || "interview-kit",
      serverSelectionTimeoutMS: 15000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
