import { useEffect, useState } from "react";
import type { Category, Product } from "@/types/product";

export type ProductResponse = {
  products: Product[];
  categories: Category[];
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        const productsData = (await productsRes.json()) as Product[];
        const categoriesData = (await categoriesRes.json()) as Category[];

        if (active) {
          setProducts(productsData);
          setCategories(categoriesData);
        }
      } catch {
        if (active) {
          setProducts([]);
          setCategories([]);
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
  }, []);

  return { products, categories, isLoading };
}
