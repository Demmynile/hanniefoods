import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

type ResponseData = {
  message?: string;
  documentId?: string;
  error?: string;
  details?: string;
};

const readSanityError = async (response: Response) => {
  try {
    const data = await response.json();
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error?.description === "string") return data.error.description;
    return JSON.stringify(data);
  } catch (error) {
    const text = await response.text();
    if (text) return text;
    return error instanceof Error ? error.message : "Unknown error";
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { userId } = getAuth(req);

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  if (!projectId) {
    return res.status(500).json({
      error: "Sanity project ID is missing",
    });
  }

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method === "POST") {
    try {
      const {
        title,
        price,
        stock,
        category,
        description,
        badge,
        rating,
        imageAssetId,
        imageAssetIds,
      } = req.body;

      const document = {
        _type: "product",
        title,
        slug: { current: title.toLowerCase().replace(/\s+/g, "-") },
        price: parseFloat(price),
        stock: parseInt(stock),
        category: {
          _type: "reference",
          _ref: category,
        },
        description,
        badge: badge || "",
        rating: parseFloat(rating) || 0,
        inStock: parseInt(stock) > 0,
        featured: false,
      };

      const assetIds = Array.isArray(imageAssetIds)
        ? imageAssetIds
        : imageAssetId
          ? [imageAssetId]
          : [];

      if (assetIds.length > 0) {
        document.images = assetIds.map((assetId: string) => ({
          _type: "image",
          asset: {
            _type: "reference",
            _ref: assetId,
          },
        }));
      }

      const response = await fetch(
        `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mutations: [
              {
                create: document,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const details = await readSanityError(response);
        throw new Error(details || "Failed to create product");
      }

      const result = await response.json();
      const documentId = result.results[0]?.id;

      return res.status(201).json({
        message: "Product created successfully",
        documentId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Create product error:", errorMessage);
      return res.status(500).json({
        error: "Failed to create product",
        details: errorMessage,
      });
    }
  } else if (req.method === "PATCH") {
    try {
      const {
        id,
        title,
        price,
        stock,
        category,
        description,
        badge,
        rating,
        imageAssetId,
        imageAssetIds,
      } = req.body;

      const updates = {
        title,
        slug: { current: title.toLowerCase().replace(/\s+/g, "-") },
        price: parseFloat(price),
        stock: parseInt(stock),
        category: {
          _type: "reference",
          _ref: category,
        },
        description,
        badge: badge || "",
        rating: parseFloat(rating) || 0,
        inStock: parseInt(stock) > 0,
      };

      const assetIds = Array.isArray(imageAssetIds)
        ? imageAssetIds
        : imageAssetId
          ? [imageAssetId]
          : [];

      if (assetIds.length > 0) {
        updates.images = assetIds.map((assetId: string) => ({
          _type: "image",
          asset: {
            _type: "reference",
            _ref: assetId,
          },
        }));
      }

      const response = await fetch(
        `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mutations: [
              {
                patch: {
                  id,
                  set: updates,
                },
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const details = await readSanityError(response);
        throw new Error(details || "Failed to update product");
      }

      return res.status(200).json({
        message: "Product updated successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Update product error:", errorMessage);
      return res.status(500).json({
        error: "Failed to update product",
        details: errorMessage,
      });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;

      const response = await fetch(
        `https://${projectId}.api.sanity.io/v2024-01-01/data/mutate/${dataset}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SANITY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mutations: [
              {
                delete: {
                  id,
                },
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const details = await readSanityError(response);
        throw new Error(details || "Failed to delete product");
      }

      return res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Delete product error:", errorMessage);
      return res.status(500).json({
        error: "Failed to delete product",
        details: errorMessage,
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
