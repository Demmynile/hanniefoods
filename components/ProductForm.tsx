"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product, Category } from "@/types/product";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
};

export function ProductForm({
  mode,
  product,
  categories,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    price: product?.price.toString() || "",
    stock: product?.stock.toString() || "",
    category: product?.category.id || "",
    description: product?.description || "",
    badge: product?.badge || "",
    rating: product?.rating.toString() || "0",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const existingImages = product?.images ?? [];

  const previewUrls = useMemo(
    () => imageFiles.map((file) => URL.createObjectURL(file)),
    [imageFiles]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiEndpoint = "/api/admin/products";
      let imageAssetIds: string[] = [];

      if (imageFiles.length > 0) {
        for (const imageFile of imageFiles) {
          const uploadData = new FormData();
          uploadData.append("file", imageFile);

          const uploadResponse = await fetch("/api/admin/upload-image", {
            method: "POST",
            body: uploadData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok) {
            throw new Error(uploadResult.error || "Image upload failed");
          }

          if (uploadResult.assetId) {
            imageAssetIds = [...imageAssetIds, uploadResult.assetId];
          }
        }
      }

      const body: Record<string, unknown> = {
        title: formData.title,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        description: formData.description,
        badge: formData.badge,
        rating: parseFloat(formData.rating),
      };

      if (mode === "edit" && product) {
        body.id = product.id;
      }

      if (imageAssetIds.length > 0) {
        body.imageAssetIds = imageAssetIds;
      }

      const response = await fetch(apiEndpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to save product");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-stone-900">
          Product Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="e.g., Egusi Soup"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-900">
            Price (₦)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="100"
            min="0"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-900">
            Stock Quantity
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-900">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-900">
          Product Images
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            const maxSize = 5 * 1024 * 1024;
            const validFiles = files.filter((file) => {
              if (!file.type.startsWith("image/")) {
                toast.error("Only image files are allowed.");
                return false;
              }
              if (file.size > maxSize) {
                toast.error("Each image must be 5MB or smaller.");
                return false;
              }
              return true;
            });

            setImageFiles(validFiles);
          }}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm"
        />
        {existingImages.length > 0 && imageFiles.length === 0 && (
          <div className="mt-3">
            <p className="text-xs text-stone-500">
              Existing images (uploading new images will replace these):
            </p>
            <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {existingImages.map((imageUrl, index) => (
                <img
                  key={`${imageUrl}-${index}`}
                  src={imageUrl}
                  alt={`Existing product ${index + 1}`}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}
        {previewUrls.length > 0 && (
          <div className="mt-3">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {previewUrls.map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`Selected product ${index + 1}`}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setImageFiles([])}
              className="mt-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
            >
              Clear selected images
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-900">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          placeholder="Product description"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-900">
            Badge (Optional)
          </label>
          <input
            type="text"
            name="badge"
            value={formData.badge}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="e.g., New, Popular"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-900">
            Rating
          </label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="5"
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 md:px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:bg-amber-300"
        >
          {isLoading ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

