import type { NextApiRequest, NextApiResponse } from "next";
import { getCategories } from "@/lib/products";

export default async function handler(
  _request: NextApiRequest,
  response: NextApiResponse
) {
  // Cache for 1 hour on CDN and 30 seconds in browser
  response.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400, max-age=30"
  );
  
  const categories = await getCategories();
  response.status(200).json(categories);
}
