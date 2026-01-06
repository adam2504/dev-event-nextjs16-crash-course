import mongoose, { type Connection } from 'mongoose';

/**
 * Global cache for Mongoose connection to prevent multiple connections in development.
 * This is necessary because Next.js hot reloading can cause the connection to be recreated.
 */
const globalWithMongoose = global as typeof globalThis & {
  mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Type assertion after validation
const uri = MONGODB_URI as string;

/**
 * Cached connection object to store the database connection.
 */
let cached: {
  conn: Connection | null;
  promise: Promise<Connection> | null;
} = globalWithMongoose.mongoose || { conn: null, promise: null };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

/**
 * Connects to the MongoDB database using Mongoose with connection caching.
 * This function ensures that only one connection is established and reused across
 * multiple calls, preventing connection leaks in development environments.
 *
 * @returns Promise<Connection> - The Mongoose database connection
 * @throws Error if MONGODB_URI is not defined or connection fails
 */
async function connectToDatabase(): Promise<Connection> {
  // Return existing connection if already established
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  // If no promise exists, create a new connection promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log('Connected to MongoDB');
        return mongooseInstance.connection;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null; // Reset promise on failure
        throw error;
      });
  }

  // Wait for the connection promise to resolve
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on error
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
