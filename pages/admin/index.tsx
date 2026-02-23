"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { FiEdit2, FiTrash2, FiPlus, FiLogOut, FiRefreshCw } from "react-icons/fi";
import { ProductForm } from "@/components/ProductForm";
import { Analytics } from "@/components/Analytics";
import type { Product, Category } from "@/types/product";

type FormMode = "create" | "edit" | null;

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const pageSize = 8;

  const isAdmin = Boolean(user?.publicMetadata?.isAdmin);

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

  // Security: Only load data if authenticated and admin
  useEffect(() => {
    if (isLoaded && isSignedIn && isAdmin) {
      fetchProducts();
      fetchCategories();
    }
  }, [isLoaded, isSignedIn, isAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordInput.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    try {
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (response.ok) {
        setIsPasswordAuthenticated(true);
        setPasswordInput("");
        toast.success("Welcome to the admin panel!");
      } else {
        setPasswordError("Invalid password. Please try again.");
      }
    } catch (error) {
      setPasswordError("Error verifying password. Please try again.");
    }
  };

  const handleGrantAdmin = async () => {
    try {
      const response = await fetch("/api/admin/setup", { method: "POST" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      await user?.reload();
      toast.success("Admin status granted!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to grant admin access"
      );
    }
  };

  const handleCreateClick = () => {
    setSelectedProduct(null);
    setFormMode("create");
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormMode("edit");
  };

  const handleFormClose = () => {
    setFormMode(null);
    setSelectedProduct(null);
  };

  const handleFormSuccess = async (isNew: boolean) => {
    toast.success(isNew ? "Product created!" : "Product updated!");
    handleFormClose();
    // Wait for Sanity to propagate the changes (increased from 800ms to 1500ms)
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Refresh products with cache bypass using timestamp
    try {
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to refresh products:", response.status, text);
        throw new Error("Failed to refresh products");
      }
      const data = await response.json();
      console.log("Products refreshed:", data.length, "products");
      setProducts(data);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast.error("Products updated but list refresh failed. Please reload the page.");
    }
  };

  const handleDeleteClick = async (productId: string, productTitle: string) => {
    if (!confirm(`Delete "${productTitle}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });

      if (!response.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted!");
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product"
      );
    }
  };

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const pagedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Show loading state while checking authentication and permissions
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900 mx-auto"></div>
          <p className="text-stone-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not signed in, show login
  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-2xl p-8 text-center">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Admin Portal</h1>
            <p className="text-stone-600 mb-8">Please sign in to access the admin dashboard</p>
            <SignInButton mode="modal">
              <button className="w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/50">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  // If signed in but not admin, show admin setup option
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2 text-center">Admin Access</h1>
            <p className="text-center text-stone-600 mb-8">You don't have admin access yet. Contact an administrator or use the setup option below.</p>
            
            <button
              onClick={handleGrantAdmin}
              className="w-full rounded-lg bg-stone-900 px-4 py-2 font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/50"
            >
              Grant Admin Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show password authentication form if not authenticated
  if (!isPasswordAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2 text-center">Admin Access</h1>
            <p className="text-center text-stone-600 mb-8">Enter the admin password to continue</p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-stone-900 mb-2">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 placeholder-stone-500 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-stone-900 px-4 py-2 font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/50"
              >
                Unlock Admin Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm md:text-base text-stone-600">Manage your food products and inventory</p>
        </div>
        <SignOutButton>
          <button className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:border-stone-300">
            <FiLogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </SignOutButton>
      </div>

      {/* Toggle Analytics */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                showAnalytics
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>
          </div>

          {/* Analytics Section */}
          {showAnalytics && (
            <div className="space-y-4">
              <Analytics products={products} categories={categories} />
            </div>
          )}

          {/* Products Section */}
          <div>
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold text-stone-900">Products</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchProducts();
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  title="Refresh products"
                >
                  <FiRefreshCw size={18} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleCreateClick}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  <FiPlus size={18} />
                  Add Product
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-stone-600">Loading products...</div>
            ) : (
              <div className="space-y-4">
                {products.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-stone-200">
                    <table className="w-full min-w-160">
                      <thead className="border-b border-stone-200 bg-stone-50">
                        <tr>
                          <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-stone-900">
                            Image
                          </th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-stone-900">
                            Product
                          </th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-stone-900">
                            Price
                          </th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-stone-900">
                            Stock
                          </th>
                          <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-stone-900">
                            Rating
                          </th>
                          <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-stone-900">
                            Status
                          </th>
                          <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-stone-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedProducts.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b border-stone-100 hover:bg-stone-50"
                          >
                            <td className="px-3 md:px-6 py-3">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.title}
                                  className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-stone-100 text-xs text-stone-500">
                                  No image
                                </div>
                              )}
                            </td>
                            <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-stone-900">
                              <div className="max-w-30 md:max-w-none truncate">
                                {product.title}
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-stone-600">
                              ₦{product.price.toLocaleString()}
                            </td>
                            <td className="px-3 md:px-6 py-3 text-xs md:text-sm text-stone-600">
                              {product.stock}
                            </td>
                            <td className="hidden sm:table-cell px-3 md:px-6 py-3 text-xs md:text-sm text-stone-600">
                              {product.rating}⭐
                            </td>
                            <td className="hidden lg:table-cell px-3 md:px-6 py-3 text-xs md:text-sm">
                              {product.stock > 0 ? (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                  In Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                  Out of Stock
                                </span>
                              )}
                            </td>
                            <td className="px-3 md:px-6 py-3 text-xs md:text-sm">
                              <div className="flex gap-1 md:gap-2">
                                <button
                                  onClick={() => handleEditClick(product)}
                                  className="rounded-lg bg-blue-100 p-1.5 md:p-2 text-blue-700 hover:bg-blue-200 transition-colors"
                                  title="Edit product"
                                >
                                  <FiEdit2 size={14} className="md:hidden" />
                                  <FiEdit2 size={16} className="hidden md:block" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(product.id, product.title)
                                  }
                                  className="rounded-lg bg-red-100 p-1.5 md:p-2 text-red-700 hover:bg-red-200 transition-colors"
                                  title="Delete product"
                                >
                                  <FiTrash2 size={14} className="md:hidden" />
                                  <FiTrash2 size={16} className="hidden md:block" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-3 md:px-6 py-3 text-xs md:text-sm text-stone-600">
                      <span className="text-center sm:text-left">
                        Showing {(currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, products.length)} of {products.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="rounded-lg border border-stone-200 px-2 md:px-3 py-1 text-xs md:text-sm font-semibold text-stone-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="text-xs text-stone-500 whitespace-nowrap">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="rounded-lg border border-stone-200 px-2 md:px-3 py-1 text-xs md:text-sm font-semibold text-stone-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-stone-600">No products found.</p>
                )}
              </div>
            )}
          </div>

      {/* Product Form Modal */}
      {formMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="relative max-h-screen w-full max-w-2xl overflow-y-auto rounded-xl sm:rounded-2xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-semibold text-stone-900">
                {formMode === "create" ? "Add New Product" : "Edit Product"}
              </h2>
              <button
                onClick={handleFormClose}
                className="text-stone-500 hover:text-stone-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <ProductForm
                mode={formMode}
                product={selectedProduct}
                categories={categories}
                onClose={handleFormClose}
                onSuccess={() => handleFormSuccess(formMode === "create")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
