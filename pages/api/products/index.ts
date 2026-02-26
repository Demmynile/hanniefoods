import type { NextApiRequest, NextApiResponse } from "next";
import { getProducts, getProductsNoCache } from "@/lib/products";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // Check if this is a cache-bypass request (has timestamp query param)
  const bypassCache = request.query.t !== undefined;
  
  if (bypassCache) {
    // No caching for fresh data requests
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", "0");
  } else {
    // Cache for 30 seconds in browser (short TTL for dynamic data)
    response.setHeader(
      "Cache-Control",
      "public, max-age=30, s-maxage=300, stale-while-revalidate=600"
    );
  }
  
  // Use timestamp-based ETag to invalidate cache
  const eTag = `"products-${Date.now()}"`;
  response.setHeader("ETag", eTag);

  if (request.headers["if-none-match"] === eTag && !bypassCache) {
    response.status(304).end();
    return;
  }

  try {
    // Always use non-CDN client for fresh data to avoid Sanity CDN propagation delays
    const products = await getProductsNoCache();
    response.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    response.status(500).json({ error: "Failed to fetch products" });
  }
}