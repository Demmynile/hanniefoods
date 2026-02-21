import type { NextApiRequest, NextApiResponse } from "next";
import { getProducts } from "@/lib/products";

export default async function handler(
  _request: NextApiRequest,
  response: NextApiResponse
) {
  // Cache for 2 hours on CDN and 1 minute in browser
  response.setHeader(
    "Cache-Control",
    "public, s-maxage=7200, stale-while-revalidate=172800, max-age=60, immutable"
  );
  response.setHeader("ETag", `"products-v1"`);

  try {
    const products = await getProducts();
    response.status(200).json(products);
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch products" });
  }
}