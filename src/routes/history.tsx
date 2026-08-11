import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, History as HistoryIcon, Trash2 } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { AuroraBackground } from "@/components/AuroraBackground";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteHistory, useHistory } from "@/lib/queries";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Try-On History — AI VISUALIZER" },
      { name: "description", content: "Revisit and download every AI try-on you have generated." },
      { property: "og:title", content: "Try-On History — AI VISUALIZER" },
      { property: "og:description", content: "Every look you generated, saved securely to your account." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <HistoryPage />
    </RequireAuth>
  ),
});

function HistoryPage() {
  const { user } = useAuth();
  const history = useHistory(user?.id);
  const remove = useDeleteHistory(user?.id);

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <AppNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Try-on history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your generated looks, newest first.</p>

        {history.isLoading && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="shimmer aspect-[3/4] rounded-3xl bg-muted" />
            ))}
          </div>
        )}

        {!history.isLoading && (history.data?.length ?? 0) === 0 && (
          <div className="glass mt-8 flex flex-col items-center gap-3 rounded-3xl p-14 text-center">
            <HistoryIcon className="size-8 text-primary" />
            <p className="font-display text-lg font-semibold">No try-ons yet</p>
            <Button variant="hero" asChild>
              <Link to="/dashboard">Start your first try-on</Link>
            </Button>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {history.data?.map((row) => (
            <article key={row.id} className="glass overflow-hidden rounded-3xl shadow-soft">
              {row.signedUrl ? (
                <img
                  src={row.signedUrl}
                  alt={`Try-on of ${row.product_name}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
              ) : (
                <div className="aspect-[3/4] w-full bg-muted" />
              )}
              <div className="space-y-2 p-4">
                <h2 className="truncate font-display text-sm font-semibold">{row.product_name}</h2>
                <p className="text-xs text-muted-foreground">
                  {row.product_brand} · {new Date(row.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  {row.signedUrl && (
                    <Button variant="glass" size="sm" className="flex-1" asChild>
                      <a href={row.signedUrl} download={`${row.product_id}.png`}>
                        <Download className="size-4" /> Save
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Delete try-on"
                    onClick={() => remove.mutate(row.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}