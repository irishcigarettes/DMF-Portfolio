import { connect } from "@planetscale/database";

/**
 * Email subscription database management
 */

// TypeScript interface for subscription rows
export interface EmailSubscriptionRow {
  email: string;
  type: string;
}

let db:
  | ReturnType<typeof connect>
  | null = null;

function getDb(): ReturnType<typeof connect> {
  const host = process.env.DATABASE_HOST;
  const username = process.env.DATABASE_USERNAME;
  const password = process.env.DATABASE_PASSWORD;

  if (!host) throw new Error("DATABASE_HOST environment variable is not set");
  if (!username) throw new Error("DATABASE_USERNAME environment variable is not set");
  if (!password) throw new Error("DATABASE_PASSWORD environment variable is not set");

  if (!db) {
    db = connect({ host, username, password });
  }

  return db;
}

// Constant for HN subscription type
const HN_TYPE = "HACKER_NEWS";

/**
 * Fetch all email subscribers for Hacker News digest
 */
export async function getHNSubscribers(): Promise<EmailSubscriptionRow[]> {
  const db = getDb();
  const result = await db.execute(`SELECT * FROM EmailSubscription WHERE type = ?`, [HN_TYPE]);
  return result.rows as EmailSubscriptionRow[];
}

/**
 * Fetch a single subscriber by email
 */
export async function getSubscriberByEmail(email: string): Promise<EmailSubscriptionRow | null> {
  const db = getDb();
  const result = await db.execute(
    `SELECT * FROM EmailSubscription WHERE email = ? AND type = ? LIMIT 1`,
    [email, HN_TYPE],
  );
  return (result.rows[0] as EmailSubscriptionRow) || null;
}

/**
 * Delete a subscription by email
 */
export async function deleteSubscription(email: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute(`DELETE FROM EmailSubscription WHERE email = ? AND type = ?`, [
    email,
    HN_TYPE,
  ]);
  return result.rowsAffected > 0;
}

/**
 * Get count of HN subscribers
 */
export async function getHNSubscriberCount(): Promise<number> {
  const db = getDb();
  const result = await db.execute(
    `SELECT COUNT(*) as count FROM EmailSubscription WHERE type = ?`,
    [HN_TYPE],
  );
  const row = result.rows[0] as { count: number };
  return row.count;
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  email: string,
): Promise<{ success: boolean; alreadyExists: boolean }> {
  const db = getDb();
  // Check if subscription already exists
  const existing = await getSubscriberByEmail(email);
  if (existing) {
    return { success: false, alreadyExists: true };
  }

  // Insert new subscription
  await db.execute(`INSERT INTO EmailSubscription (email, type) VALUES (?, ?)`, [email, HN_TYPE]);

  return { success: true, alreadyExists: false };
}
