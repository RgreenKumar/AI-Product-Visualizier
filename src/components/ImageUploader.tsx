import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToDataUrl } from "@/lib/image";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg"];

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        toast.error("Please upload a PNG, JPG or JPEG photo.");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error("That photo is larger than 12 MB. Try a smaller one.");
        return;
      }
      setProgress(35);
      try {
        const dataUrl = await fileToDataUrl(file);
        setProgress(100);
        onChange(dataUrl);
        toast.success("Photo ready for try-on");
      } catch {
        toast.error("We couldn't read that image.");
      } finally {
        setTimeout(() => setProgress(0), 500);
      }
    },
    [onChange],
  );

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="glass relative overflow-hidden rounded-3xl p-3"
          >
            <img
              src={value}
              alt="Your uploaded photo"
              className="aspect-[3/4] w-full rounded-2xl object-cover"
            />
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => inputRef.current?.click()}>
                <ImagePlus className="size-4" /> Replace
              </Button>
              <Button variant="ghost" onClick={() => onChange(null)}>
                <Trash2 className="size-4" /> Remove
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="dropzone"
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              void handleFile(event.dataTransfer.files[0]);
            }}
            className={`glass flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-all ${
              dragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/60"
            }`}
          >
            <span className="gradient-brand flex size-14 items-center justify-center rounded-2xl shadow-elegant">
              <UploadCloud className="size-7 text-primary-foreground" />
            </span>
            <span className="font-display text-base font-semibold">Drag & drop your photo</span>
            <span className="text-sm text-muted-foreground">
              or <span className="text-primary underline underline-offset-4">browse files</span> — PNG, JPG, JPEG
            </span>
            <span className="text-xs text-muted-foreground">
              Full-body, well-lit photos give the most realistic results.
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {progress > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="gradient-brand h-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
    </div>
  );
}