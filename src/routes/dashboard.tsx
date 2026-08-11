import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AppNav } from "@/components/AppNav";
import { AuroraBackground } from "@/components/AuroraBackground";
import { ImageUploader } from "@/components/ImageUploader";
import { ProductCard } from "@/components/ProductCard";
import { RequireAuth } from "@/components/RequireAuth";
import { ResultPanel } from "@/components/ResultPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_GROUPS, groups, products, type CategoryGroup, type Product } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { urlToDataUrl } from "@/lib/image";
import { useToggleWishlist, useWishlist } from "@/lib/queries";
import { runTryOn } from "@/lib/tryon.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Try-On Studio — AI VISUALIZER" },
      {
        name: "description",
        content: "Upload your photo and try on shirts, dresses, sarees, shoes, watches and more with AI.",
      },
      { property: "og:title", content: "Try-On Studio — AI VISUALIZER" },
      { property: "og:description", content: "Your AI-powered fitting room for every fashion category." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

function Dashboard() {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);
  const [group, setGroup] = useState<CategoryGroup>("Top Wear");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [active, setActive] = useState<Product | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const wishlist = useWishlist(user?.id);
  const toggleWishlist = useToggleWishlist(user?.id);
  const tryOn = useServerFn(runTryOn);

  const tryOnMutation = useMutation({
    mutationFn: async (product: Product) => {
      const [personImage, productImage] = await Promise.all([
        Promise.resolve(photo!),
        urlToDataUrl(product.image),
      ]);
      return tryOn({
        data: {
          personImage,
          productImage,
          productId: product.id,
          productName: product.name,
          productBrand: product.brand,
          productCategory: product.category,
          tryOnHint: product.tryOnHint,
        },
      });
    },
    onSuccess: (data) => {
      setResult(data.image);
      toast.success("Your try-on is ready!");
    },
    onError: (error: Error) => toast.error(error.message || "Try-on failed. Please try again."),
  });

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = products.filter((product) => {
      if (product.group !== group) return false;
      if (category !== "All" && product.category !== category) return false;
      if (!query) return true;
      return `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query);
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [group, category, search, sort]);

  const startTryOn = (product: Product) => {
    if (!photo) {
      toast.error("Upload your photo first to try this on.");
      return;
    }
    setActive(product);
    setResult(null);
    tryOnMutation.mutate(product);
  };

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <AppNav search={search} onSearchChange={setSearch} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Try-On Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload one photo, then try on anything. Your face, hair, skin tone, pose and background stay untouched.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[22rem_1fr]">
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ImageUploader value={photo} onChange={setPhoto} />
            <ResultPanel
              product={active}
              before={photo}
              after={result}
              loading={tryOnMutation.isPending}
              onClose={() => {
                setResult(null);
                setActive(null);
              }}
            />
          </div>

          <div>
            <div className="glass mb-5 flex flex-wrap items-center gap-3 rounded-2xl p-3">
              <div className="relative min-w-[12rem] flex-1 md:hidden">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products"
                  className="rounded-xl pl-9"
                  aria-label="Search products"
                />
              </div>
              <SlidersHorizontal className="hidden size-4 text-muted-foreground md:block" />
              <Select value={group} onValueChange={(value) => { setGroup(value as CategoryGroup); setCategory("All"); }}>
                <SelectTrigger className="w-[11rem] rounded-xl" aria-label="Category group">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
                <SelectTrigger className="w-[11rem] rounded-xl" aria-label="Sort products">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="rating">Top rated</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-auto text-xs text-muted-foreground">{visible.length} items</span>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {["All", ...CATEGORY_GROUPS[group]].map((item) => (
                <Button
                  key={item}
                  size="sm"
                  variant={category === item ? "hero" : "glass"}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>

            <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlisted={Boolean(wishlist.data?.includes(product.id))}
                  busy={tryOnMutation.isPending && active?.id === product.id}
                  onTryOn={startTryOn}
                  onToggleWishlist={(item) =>
                    toggleWishlist.mutate({
                      productId: item.id,
                      active: Boolean(wishlist.data?.includes(item.id)),
                    })
                  }
                />
              ))}
            </motion.div>

            {visible.length === 0 && (
              <p className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
                No products match your filters. Try a different category or search.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}