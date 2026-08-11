import { motion } from "motion/react";
import { Heart, Star, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  wishlisted?: boolean;
  busy?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onTryOn?: (product: Product) => void;
}

export function ProductCard({ product, wishlisted, busy, onToggleWishlist, onTryOn }: ProductCardProps) {
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="glass group flex flex-col overflow-hidden rounded-3xl shadow-soft transition-shadow hover:shadow-elegant"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => onToggleWishlist?.(product)}
          className="glass absolute right-3 top-3 flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110"
        >
          <Heart className={`size-4 ${wishlisted ? "fill-destructive text-destructive" : "text-foreground"}`} />
        </button>
        {discount > 0 && (
          <span className="gradient-brand absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-primary-foreground">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
            <Star className="size-3 fill-glow text-glow" />
            {product.rating}
          </span>
        </div>
        <h3 className="font-display text-sm font-semibold leading-snug">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-lg font-bold">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
        </div>
        <Button variant="hero" size="sm" className="mt-2" disabled={busy} onClick={() => onTryOn?.(product)}>
          <Wand2 className="size-4" />
          {busy ? "Generating…" : "Try On"}
        </Button>
      </div>
    </motion.article>
  );
}