export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="aurora absolute inset-0 opacity-90" />
      <div className="animate-float absolute -left-24 top-24 size-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="animate-float absolute -right-16 top-1/3 size-80 rounded-full bg-glow/20 blur-3xl [animation-delay:1.5s]" />
    </div>
  );
}