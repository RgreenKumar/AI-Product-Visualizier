import type { SupabaseClient } from "@supabase/supabase-js";

const MODEL = "google/gemini-3.1-flash-image";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface TryOnRequest {
  personImage: string;
  productImage: string;
  productId: string;
  productName: string;
  productBrand: string;
  productCategory: string;
  tryOnHint: string;
  usePythonBackend?: boolean | undefined;
}

export class TryOnError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

const PYTHON_BACKEND_URL = process.env["PYTHON_BACKEND_URL"] || "http://127.0.0.1:8000/api/tryon";

export async function generatePythonTryOnImage(input: TryOnRequest): Promise<string> {
  try {
    const res = await fetch(PYTHON_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personImage: input.personImage,
        productImage: input.productImage,
        productId: input.productId,
        productName: input.productName,
        productBrand: input.productBrand,
        productCategory: input.productCategory,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new TryOnError(`Python DL Model Error (${res.status}): ${errText.slice(0, 200)}`, res.status);
    }

    const data = (await res.json()) as { success?: boolean; image?: string };
    if (!data.image) {
      throw new TryOnError("Python DL backend did not return an image.", 502);
    }
    return data.image;
  } catch (err: any) {
    if (err instanceof TryOnError) throw err;
    throw new TryOnError(
      `Failed to connect to Python DL Backend at ${PYTHON_BACKEND_URL}. Make sure the Python server is running (python python_backend/main.py). Detail: ${err.message}`,
      503
    );
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

export async function generateTryOnImage(input: TryOnRequest, apiKey: string) {
  // If explicitly requested Python Backend or no API key, use Python DL Backend
  if (input.usePythonBackend || !apiKey) {
    return generatePythonTryOnImage(input);
  }

  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildPrompt(input) },
              { type: "image_url", image_url: { url: input.personImage } },
              { type: "image_url", image_url: { url: input.productImage } },
            ],
          },
        ],
      }),
    });

    if (response.status === 429) {
      throw new TryOnError("The AI try-on engine is busy right now. Please retry in a moment.", 429);
    }
    if (response.status === 402) {
      throw new TryOnError(
        "AI credits for this workspace are exhausted. Add credits in Settings to keep generating try-ons.",
        402,
      );
    }
    if (!response.ok) {
      // Fallback to Python DL Model
      console.warn("Cloud API request failed, falling back to Python DL model...");
      return generatePythonTryOnImage(input);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
    };
    const url = payload.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new TryOnError("The AI engine did not return an image. Try another photo.", 502);
    return url;
  } catch (err: any) {
    // Attempt fallback to Python DL Model
    if (err instanceof TryOnError && err.status === 402) {
      return generatePythonTryOnImage(input);
    }
    try {
      return await generatePythonTryOnImage(input);
    } catch {
      throw err;
    }
  }
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