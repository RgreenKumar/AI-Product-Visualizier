import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shirt, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToDataUrl } from "@/lib/image";
import { toast } from "sonner";

interface CustomDressUploaderProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export function CustomDressUploader({ value, onChange }: CustomDressUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        toast.error("Please upload a PNG, JPG or WEBP dress photo.");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error("That photo is larger than 12 MB.");
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        onChange(dataUrl);
        toast.success("Custom dress uploaded successfully!");
      } catch {
        toast.error("Could not read that dress image.");
      }
    },
    [onChange]
  );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="custom-dress-preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="glass relative overflow-hidden rounded-2xl p-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={value}
                alt="Your custom dress"
                className="size-20 rounded-xl object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Shirt className="size-3.5" /> Custom Dress Selected
                </span>
                <p className="text-xs text-muted-foreground truncate">Ready to overlay on your photo</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                    Replace
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
                    <Trash2 className="size-3.5 text-destructive" /> Clear
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="custom-dress-dropzone"
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files[0]);
            }}
            className={`glass flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-4 py-3 text-left transition-all ${
              dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="gradient-brand flex size-10 items-center justify-center rounded-xl shadow-soft">
                <UploadCloud className="size-5 text-primary-foreground" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold">Upload Your Own Dress</p>
                <p className="text-xs text-muted-foreground">PNG/JPG image of dress, top, or saree</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" type="button">
              Browse
            </Button>
          </motion.button>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
