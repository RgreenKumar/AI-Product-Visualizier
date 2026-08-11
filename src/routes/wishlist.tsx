import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ProductCard } from "@/components/ProductCard";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { useToggleWishlist, useWishlist } from "@/lib/queries";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — AI VISUALIZER" },
      { name: "description", content: "Everything you saved for later, ready to try on with AI." },
      { property: "og:title", content: "My Wishlist — AI VISUALIZER" },
      { property: "og:description", content: "Your saved fashion picks, one tap from a virtual try-on." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <WishlistPage />
    </RequireAuth>
  ),
});

function WishlistPage() {
  const { user } = useAuth();
  const wishlist = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist(user?.id);
  const saved = products.filter((product) => wishlist.data?.includes(product.id));

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <AppNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">My wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">{saved.length} saved items</p>

        {saved.length === 0 ? (
          <div className="glass mt-8 flex flex-col items-center gap-3 rounded-3xl p-14 text-center">
            <Heart className="size-8 text-primary" />
            <p className="font-display text-lg font-semibold">Nothing saved yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tap the heart on any product to keep it here for later.
            </p>
            <Button variant="hero" asChild>
              <Link to="/dashboard">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted
                onToggleWishlist={(item) =>
                  toggleWishlist.mutate({ productId: item.id, active: true })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}