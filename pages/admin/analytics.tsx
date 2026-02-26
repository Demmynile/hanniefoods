"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { AdminLayout } from "@/components/AdminLayout";
import type { Product, Category } from "@/types/product";

// Dynamically import Analytics with SSR disabled to prevent build errors with recharts
const Analytics = dynamic(() => import("@/components/Analytics").then(mod => ({ default: mod.Analytics })), {
  ssr: false,
  loading: () => (
    <div className="text-stone-600 flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900"></div>
      Loading analytics...
    </div>
  ),
});

function AnalyticsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        const text = await response.text();
        console.error("API Error:", text);
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        const text = await response.text();
        console.error("API Error:", text);
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Analytics</h1>
        <p className="mt-1 text-sm md:text-base text-stone-600">View insights and statistics</p>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white border border-stone-200/70 p-6 shadow-sm">
          <div className="text-stone-600 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900"></div>
            Loading analytics...
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white border border-stone-200/70 p-6 shadow-sm">
          <Analytics products={products} categories={categories} />
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <AnalyticsPageContent />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
