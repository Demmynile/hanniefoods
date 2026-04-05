import type { Category, Product } from "@/types/product";

export const categories: Category[] = [
  { id: "cat-pantry", title: "Pantry", slug: "pantry", image: null },
  { id: "cat-fresh", title: "Fresh", slug: "fresh", image: null },
  { id: "cat-meals", title: "Ready Meals", slug: "ready-meals", image: null },
];

export const products: Product[] = [
  {
    id: "prod-olive-oil",
    title: "Cold-Pressed Olive Oil",
    slug: "cold-pressed-olive-oil",
    price: 18,
    category: categories[0],
    images: [],
    description: "A pantry staple with a smooth, peppery finish.",
    featured: true,
    rating: 4.7,
    stock: 24,
    inStock: true,
    badge: "Chef pick",
  },
  {
    id: "prod-seasonal-produce",
    title: "Seasonal Produce Box",
    slug: "seasonal-produce-box",
    price: 28,
    category: categories[1],
    images: [],
    description: "A curated mix of crisp, local produce.",
    featured: true,
    rating: 4.9,
    stock: 12,
    inStock: true,
    badge: "Limited",
  },
  {
    id: "prod-simmered-ragu",
    title: "Slow Simmered Ragu",
    slug: "slow-simmered-ragu",
    price: 22,
    category: categories[2],
    images: [],
    description: "Rich, comforting, and ready in minutes.",
    featured: false,
    rating: 4.5,
    stock: 0,
    inStock: false,
    badge: null,
  },
];
