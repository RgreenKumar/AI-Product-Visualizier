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
  usePythonBackend: z.boolean().optional(),
});

export const runTryOn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => TryOnInput.parse(data))
  .handler(async ({ data, context }) => {
    const { generateTryOnImage, persistTryOn, TryOnError } = await import("./tryon.server");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    try {
      const tryOnPayload = {
        ...data,
        usePythonBackend: Boolean(data.usePythonBackend),
      };
      const resultDataUrl = await generateTryOnImage(tryOnPayload, apiKey || "");
      const { resultPath } = await persistTryOn(context.supabase, context.userId, tryOnPayload, resultDataUrl);
      return { image: resultDataUrl, resultPath };
    } catch (error) {
      if (error instanceof TryOnError) throw new Error(error.message);
      throw error;
    }
  });