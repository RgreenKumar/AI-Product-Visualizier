import type { SupabaseClient } from "@supabase/supabase-js";

const MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface TryOnRequest {
  personImage: string;
  productImage: string;
  productId: string;
  productName: string;
  productBrand: string;
  productCategory: string;
  tryOnHint: string;
}

export class TryOnError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function buildPrompt(input: TryOnRequest) {
  return [
    "You are a professional virtual try-on engine for a fashion marketplace.",
    "The FIRST image is a photo of a real person. The SECOND image is a fashion product.",
    `Edit the FIRST image so the person is wearing: ${input.tryOnHint} (product: ${input.productName} by ${input.productBrand}, category ${input.productCategory}).`,
    "Absolute requirements:",
    "- Keep the person's face, facial features, expression, hairstyle and skin tone pixel-accurate and unchanged.",
    "- Keep the exact same body pose, proportions, camera angle, framing and lighting.",
    "- Keep the original background completely unchanged.",
    "- Only replace or add the specified garment or accessory; leave every other worn item as it is unless it physically conflicts with the new item.",
    "- Match the product's exact colour, texture, pattern and cut from the second image.",
    "- Render realistic fabric drape, folds, contact shadows and correct occlusion so the result looks like a real photograph.",
    "Return only the edited photograph.",
  ].join("\n");
}

function dataUrlToParts(dataUrl: string) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match?.[1] || !match[2]) throw new TryOnError("Invalid image data", 400);
  return { mime: match[1], base64: match[2] };
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function toInlineData(source: string): Promise<{ mime: string; base64: string }> {
  if (source.startsWith("data:")) return dataUrlToParts(source);
  const res = await fetch(source);
  if (!res.ok) throw new TryOnError("Could not fetch product image", 502);
  const buffer = await res.arrayBuffer();
  const mime = res.headers.get("content-type") || "image/jpeg";
  const base64 = Buffer.from(buffer).toString("base64");
  return { mime, base64 };
}

export async function generateTryOnImage(input: TryOnRequest, apiKey: string) {
  const person = await toInlineData(input.personImage);
  const product = await toInlineData(input.productImage);

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: buildPrompt(input) },
            { inline_data: { mime_type: person.mime, data: person.base64 } },
            { inline_data: { mime_type: product.mime, data: product.base64 } },
          ],
        },
      ],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
  });

  if (response.status === 429) {
    throw new TryOnError("The AI try-on engine is busy right now. Please retry in a moment.", 429);
  }
  if (!response.ok) {
    const detail = await response.text();
    throw new TryOnError(`Try-on generation failed: ${detail.slice(0, 300)}`, response.status);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>;
  };
  const part = payload.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData?.data) throw new TryOnError("The AI engine did not return an image. Try another photo.", 502);
  return `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
}

export async function persistTryOn(
  supabase: SupabaseClient,
  userId: string,
  input: TryOnRequest,
  resultDataUrl: string,
) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const source = dataUrlToParts(input.personImage);
  const result = dataUrlToParts(resultDataUrl);

  const sourcePath = `${userId}/source/${stamp}.${source.mime.includes("png") ? "png" : "jpg"}`;
  const resultPath = `${userId}/result/${stamp}.png`;

  await supabase.storage
    .from("tryon")
    .upload(sourcePath, base64ToBytes(source.base64), { contentType: source.mime, upsert: true });

  const upload = await supabase.storage
    .from("tryon")
    .upload(resultPath, base64ToBytes(result.base64), { contentType: result.mime, upsert: true });
  if (upload.error) throw new TryOnError(`Could not save the result: ${upload.error.message}`);

  await supabase.from("tryon_history").insert({
    user_id: userId,
    product_id: input.productId,
    product_name: input.productName,
    product_brand: input.productBrand,
    product_image: input.productImage.startsWith("data:") ? null : input.productImage,
    source_path: sourcePath,
    result_path: resultPath,
  });

  return { sourcePath, resultPath };
}