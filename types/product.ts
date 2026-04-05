export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  description: string;
  images?: string[];
  category: Category;
  stock: number;
  inStock?: boolean;
  rating: number;
  featured?: boolean;
  badge?: string | null;
}

export interface Category {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  image?: string | null;
}
