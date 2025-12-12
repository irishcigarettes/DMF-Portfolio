import { unstable_cache } from "next/cache";

export interface PeopleDetectionResult {
  containsPeople: boolean;
  reasons: string[];
}

interface GoogleVisionImageAnnotateResponse {
  responses?: Array<{
    faceAnnotations?: unknown[];
    localizedObjectAnnotations?: Array<{
      name?: string;
      score?: number;
    }>;
    error?: {
      message?: string;
    };
  }>;
}

function getGoogleVisionApiKey(): string {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env var: GOOGLE_CLOUD_VISION_API_KEY");
  }
  return apiKey;
}

async function detectPeopleInImageUncached(imageUrl: string): Promise<PeopleDetectionResult> {
  const apiKey = getGoogleVisionApiKey();

  const url = new URL("https://vision.googleapis.com/v1/images:annotate");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: [{ type: "FACE_DETECTION" }, { type: "OBJECT_LOCALIZATION" }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Vision API error: ${res.status} ${body}`);
  }

  const json = (await res.json()) as GoogleVisionImageAnnotateResponse;
  const response = json.responses?.[0];

  const apiErrorMessage = response?.error?.message;
  if (apiErrorMessage) {
    throw new Error(`Google Vision API response error: ${apiErrorMessage}`);
  }

  const reasons: string[] = [];

  if ((response?.faceAnnotations?.length ?? 0) > 0) {
    reasons.push("FACE_DETECTION");
  }

  const personObjects =
    response?.localizedObjectAnnotations?.filter((obj) => {
      const name = obj.name?.toLowerCase();
      const score = obj.score ?? 0;
      return name === "person" && score >= 0.5;
    }) ?? [];

  if (personObjects.length > 0) {
    reasons.push("OBJECT_LOCALIZATION:person");
  }

  return { containsPeople: reasons.length > 0, reasons };
}

/**
 * Cached people detection, keyed by the image URL argument.
 *
 * Revalidates weekly to limit Vision API cost and keep results stable.
 */
export const detectPeopleInImage = unstable_cache(
  async (imageUrl: string) => detectPeopleInImageUncached(imageUrl),
  ["google-vision-detect-people"],
  { revalidate: 60 * 60 * 24 * 7 },
);
