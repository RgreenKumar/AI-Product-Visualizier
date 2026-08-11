import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TryOnInput = z.object({
  personImage: z.string().startsWith("data:image/"),
  productImage: z.string().startsWith("data:image/"),
  productId: z.string().min(1),
  productName: z.string().min(1),
  productBrand: z.string().min(1),
  productCategory: z.string().min(1),
  tryOnHint: z.string().min(1),
});

export const runTryOn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => TryOnInput.parse(data))
  .handler(async ({ data, context }) => {
    const { generateTryOnImage, persistTryOn, TryOnError } = await import("./tryon.server");
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    try {
      const resultDataUrl = await generateTryOnImage(data, apiKey);
      const { resultPath } = await persistTryOn(context.supabase, context.userId, data, resultDataUrl);
      return { image: resultDataUrl, resultPath };
    } catch (error) {
      if (error instanceof TryOnError) throw new Error(error.message);
      throw error;
    }
  });