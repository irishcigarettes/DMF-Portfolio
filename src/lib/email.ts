import { ServerClient } from "postmark";

import { HackerNewsPost } from "@/types/hackernews";

/**
 * Email service for sending HN digest emails via Postmark
 */

// Email constants
export const BASE_EMAIL = "hi@brianlovin.com";

export const BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://brianlovin.com";

const POSTMARK_TEMPLATE_ID = 18037634;

let postmarkClient: ServerClient | null = null;

function getPostmarkClient(): ServerClient {
  const clientId = process.env.POSTMARK_CLIENT_ID;
  if (!clientId) {
    throw new Error("POSTMARK_CLIENT_ID environment variable is not set");
  }

  if (!postmarkClient) {
    postmarkClient = new ServerClient(clientId);
  }

  return postmarkClient;
}

export interface DigestEmailData {
  to: string;
  date: string;
  posts: HackerNewsPost[];
  unsubscribeUrl: string;
}

/**
 * Send a Hacker News digest email to a subscriber
 */
export async function sendHNDigestEmail({ to, date, posts, unsubscribeUrl }: DigestEmailData) {
  const postmarkClient = getPostmarkClient();
  const result = await postmarkClient.sendEmailWithTemplate({
    From: BASE_EMAIL,
    To: to,
    TemplateId: POSTMARK_TEMPLATE_ID,
    TemplateModel: {
      date,
      posts,
      unsubscribe_url: unsubscribeUrl,
    },
  });

  console.log(`✅ Sent HN digest to ${to}`, {
    messageId: result.MessageID,
    submittedAt: result.SubmittedAt,
  });

  return result;
}
