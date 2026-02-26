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
    
    // Remove duplicate categories by ID
    const uniqueCategories = categories.reduce((acc: Category[], cat) => {
      const exists = acc.some(c => (c.id || c.slug) === (cat.id || cat.slug));
      return exists ? acc : [...acc, cat];
    }, []);
    
    return uniqueCategories.length ? uniqueCategories : fallbackCategories;
  } catch {
    return fallbackCategories;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}
