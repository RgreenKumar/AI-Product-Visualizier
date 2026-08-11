import { useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

interface CompareSliderProps {
  before: string;
  after: string;
}

export function CompareSlider({ before, after }: CompareSliderProps) {
  const [position, setPosition] = useState(50);
  const frame = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={frame}
      className="relative aspect-[3/4] w-full select-none overflow-hidden rounded-3xl border border-border bg-muted"
      onPointerMove={(event) => event.buttons === 1 && move(event.clientX)}
      onPointerDown={(event) => move(event.clientX)}
    >
      <img src={after} alt="AI generated try-on result" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img
          src={before}
          alt="Your original photo"
          className="absolute inset-0 h-full object-cover"
          style={{ width: frame.current?.clientWidth ?? "100%" }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold">
          Before
        </span>
      </div>
      <span className="absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold">
        After
      </span>
      <div className="absolute inset-y-0 w-0.5 bg-background/90" style={{ left: `${position}%` }}>
        <span className="gradient-brand absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-elegant">
          <MoveHorizontal className="size-5 text-primary-foreground" />
        </span>
      </div>
    </div>
  );
}