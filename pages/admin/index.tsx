"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FiPackage, FiBarChart2, FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { AdminLayout } from "@/components/AdminLayout";
import type { Product, Category } from "@/types/product";

function DashboardContent() {
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

  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const averagePrice = products.length > 0 
    ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length)
    : 0;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: FiPackage,
      color: "bg-blue-100 text-blue-700",
      href: "/admin/products"
    },
    {
      title: "In Stock",
      value: inStockProducts,
      icon: FiShoppingBag,
      color: "bg-green-100 text-green-700",
      href: "/admin/products"
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts,
      icon: FiTrendingUp,
      color: "bg-red-100 text-red-700",
      href: "/admin/products"
    },
    {
      title: "Avg. Price",
      value: `₦${averagePrice.toLocaleString()}`,
      icon: FiBarChart2,
      color: "bg-amber-100 text-amber-700",
      href: "/admin/analytics"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-1 text-sm md:text-base text-stone-600">Welcome to your admin panel</p>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white border border-stone-200/70 p-6 shadow-sm">
          <div className="text-stone-600 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900"></div>
            Loading dashboard...
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="rounded-lg bg-white border border-stone-200/70 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-600">{stat.title}</p>
                      <p className="mt-2 text-3xl font-bold text-stone-900">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-white border border-stone-200/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/admin/products"
                className="flex items-center gap-3 rounded-lg border border-stone-200/70 bg-stone-50/50 p-4 transition hover:bg-stone-100"
              >
                <FiPackage size={20} className="text-stone-700" />
                <div>
                  <p className="font-medium text-stone-900">Manage Products</p>
                  <p className="text-xs text-stone-600">Add, edit, or remove products</p>
                </div>
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center gap-3 rounded-lg border border-stone-200/70 bg-stone-50/50 p-4 transition hover:bg-stone-100"
              >
                <FiBarChart2 size={20} className="text-stone-700" />
                <div>
                  <p className="font-medium text-stone-900">View Analytics</p>
                  <p className="text-xs text-stone-600">Check your store statistics</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg bg-white border border-stone-200/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Store Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">Total Categories</span>
                <span className="font-semibold text-stone-900">{categories.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">Featured Products</span>
                <span className="font-semibold text-stone-900">
                  {products.filter(p => p.featured).length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-stone-600">Products with Images</span>
                <span className="font-semibold text-stone-900">
                  {products.filter(p => p.images && p.images.length > 0).length}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <DashboardContent />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
