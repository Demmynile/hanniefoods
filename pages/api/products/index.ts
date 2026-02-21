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
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  } else {
    // Cache for 30 seconds in browser (short TTL for dynamic data)
    response.setHeader(
      "Cache-Control",
      "public, max-age=30, s-maxage=300, stale-while-revalidate=600"
    );
  }
  
  response.setHeader("ETag", `"products-${Date.now()}"`);

  try {
    // Use non-CDN client if bypassing cache
    const products = bypassCache ? await getProductsNoCache() : await getProducts();
    response.status(200).json(products);
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch products" });
  }
}