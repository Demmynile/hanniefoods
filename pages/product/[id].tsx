import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DetailSkeleton } from "@/components/Skeletons";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types/product";

export default function ProductDetailPage() {
  const router = useRouter();
  const id = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { products, isLoading: isProductsLoading } = useProducts();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = (await response.json()) as Product | null;
        if (active) {
          setProduct(data);
          setQuantity(1);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        if (active) {
          setProduct(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const recommendations = useMemo(() => {
    if (!product) {
      return [];
    }
    return products
      .filter(
        (item) =>
          item.category.id === product.category.id && item.id !== product.id
      )
      .slice(0, 4);
  }, [products, product]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    const existingQty =
      items.find((item) => item.product.id === product.id)?.quantity ?? 0;
    addItem(product);
    updateQuantity(product.id, existingQty + quantity);
    toast.success(`${product.title} added to cart!`);
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="rounded-3xl border border-amber-200/60 bg-white/80 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-stone-900">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Try selecting another item from the catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white/80 shadow-xl">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-96 items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {product.badge ? (
              <span className="w-fit rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
                {product.badge}
              </span>
            ) : null}
            <h1 className="text-3xl font-semibold text-stone-900 [font-family:var(--font-display)]">
              {product.title}
            </h1>
            <p className="text-sm uppercase tracking-widest text-stone-500">
              {product.category.title}
            </p>
          </div>

          <p className="text-base text-stone-600">{product.description}</p>

          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-amber-100 px-4 py-2 text-lg font-semibold text-stone-900">
              ${product.price}
            </span>
            <span className="text-sm font-semibold text-stone-700">
              Rating {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-stone-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-stone-200/80 bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-sm font-semibold text-stone-600"
              >
                -
              </button>
              <span className="min-w-[40px] text-center text-sm font-semibold text-stone-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-sm font-semibold text-stone-600"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-stone-800 disabled:bg-stone-400"
              disabled={!product.inStock || product.stock === 0}
            >
              {product.inStock && product.stock > 0 ? "Add to cart" : "Sold out"}
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
            Recommended from {product.category.title}
          </h2>
        </div>
        {isProductsLoading ? (
          <DetailSkeleton />
        ) : recommendations.length ? (
          <ProductGrid products={recommendations} />
        ) : (
          <p className="text-sm text-stone-500">
            No similar products yet.
          </p>
        )}
      </section>
    </div>
  );
}
