import type { Category, Product } from "@/types/product";
import { categories as fallbackCategories, products as fallbackProducts } from "@/lib/mock-data";
import { sanityClient, sanityClientNoCache, sanityConfigured } from "@/lib/sanity.client";
import { categoriesQuery, productsQuery } from "@/lib/sanity.queries";

export async function getProducts(): Promise<Product[]> {
  if (!sanityConfigured) {
    return fallbackProducts;
  }

  try {
    const products = await sanityClient.fetch<Product[]>(productsQuery);
    return products.length ? products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

// Get products without CDN cache (for real-time updates)
export async function getProductsNoCache(): Promise<Product[]> {
  if (!sanityConfigured) {
    return fallbackProducts;
  }

  try {
    const products = await sanityClientNoCache.fetch<Product[]>(productsQuery);
    return products.length ? products : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!sanityConfigured) {
    return fallbackCategories;
  }

  try {
    const categories = await sanityClient.fetch<Category[]>(categoriesQuery);
    const products = await getProducts();
    const categoryImages = new Map(
      products
        .filter((product) => product.category.slug && product.images?.[0])
        .map((product) => [product.category.slug as string, product.images?.[0] ?? null])
    );
    
    // Remove duplicate categories by ID
    const uniqueCategories = categories.reduce((acc: Category[], cat) => {
      const exists = acc.some(c => (c.id || c.slug) === (cat.id || cat.slug));
      if (exists) {
        return acc;
      }

      return [
        ...acc,
        {
          ...cat,
          image: cat.image ?? (cat.slug ? categoryImages.get(cat.slug) ?? null : null),
        },
      ];
    }, []);
    
    return uniqueCategories.length ? uniqueCategories : fallbackCategories;
  } catch {
    return fallbackCategories;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.category.slug === slug);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}
