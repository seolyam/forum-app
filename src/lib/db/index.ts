import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Import all schema tables
import { categories, posts, comments, profiles } from "./schema";

// Use Supabase connection string format
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL!;

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

// Create the database instance with schema
export const db = drizzle(client, {
  schema: {
    categories,
    posts,
    comments,
    profiles,
  },
});

// Export types for use in other files
export type Database = typeof db;
