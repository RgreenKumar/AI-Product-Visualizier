import { motion } from "motion/react";
import { Download, Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompareSlider } from "@/components/CompareSlider";
import { downloadDataUrl } from "@/lib/image";
import { toast } from "sonner";
import type { Product } from "@/data/products";

interface ResultPanelProps {
  product: Product | null;
  before: string | null;
  after: string | null;
  loading: boolean;
  engineName?: string;
  onClose: () => void;
}

export function ResultPanel({ product, before, after, loading, engineName, onClose }: ResultPanelProps) {
  const share = async () => {
    if (!after) return;
    try {
      const blob = await (await fetch(after)).blob();
      const file = new File([blob], "ai-visualizer-tryon.png", { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My AI VISUALIZER try-on" });
        return;
      }
      throw new Error("unsupported");
    } catch {
      toast.info("Sharing isn't supported here — download the image instead.");
    }
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-[2rem] p-5 shadow-elegant"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="size-3.5 text-primary" /> {engineName || "AI Try-On Result"}
          </p>
          <h2 className="font-display text-xl font-bold">
            {product ? product.name : "Your try-on preview"}
          </h2>
          {product && <p className="text-sm text-muted-foreground">{product.brand}</p>}
        </div>
        {(after || loading) && (
          <Button variant="ghost" size="icon" aria-label="Close result" onClick={onClose}>
            <X className="size-4" />
          </Button>
        )}
      </header>

      {loading && (
        <div className="shimmer aspect-[3/4] w-full rounded-3xl bg-muted">
          <div className="flex size-full flex-col items-center justify-center gap-3 text-center">
            <span className="gradient-brand size-12 animate-spin rounded-full [mask:radial-gradient(farthest-side,transparent_58%,#000_60%)]" />
            <p className="font-display text-sm font-semibold">Generating your try-on…</p>
            <p className="max-w-[16rem] text-xs text-muted-foreground">
              Preserving your face, hair, skin tone, pose and background.
            </p>
          </div>
        </div>
      )}

      {!loading && after && before && <CompareSlider before={before} after={after} />}

      {!loading && !after && (
        <div className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border px-6 text-center">
          <Sparkles className="size-8 text-primary" />
          <p className="font-display text-sm font-semibold">No try-on yet</p>
          <p className="max-w-[18rem] text-xs text-muted-foreground">
            Upload your photo, then hit Try On under any product to see it on you.
          </p>
        </div>
      )}

      {after && !loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="hero"
            className="flex-1"
            onClick={() => downloadDataUrl(after, `ai-visualizer-${product?.id ?? "tryon"}.png`)}
          >
            <Download className="size-4" /> Download
          </Button>
          <Button variant="glass" onClick={() => void share()}>
            <Share2 className="size-4" /> Share
          </Button>
        </div>
      )}
    </motion.section>
  );
}