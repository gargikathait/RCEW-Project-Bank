import mongoose from "mongoose";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseConnection?: CachedConnection;
};

const cached: CachedConnection = globalWithMongoose.mongooseConnection ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongooseConnection = cached;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required. Set it in the environment; do not commit secrets.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
  }
}
