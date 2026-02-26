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
  
  try {
    const categories = await getCategories();
    
    // Ensure categories is always an array and remove any remaining duplicates
    const categoryArray = Array.isArray(categories) ? categories : [];
    const uniqueCategories = categoryArray.reduce((acc, cat) => {
      const exists = acc.some(c => (c.id || c.slug) === (cat.id || cat.slug));
      return exists ? acc : [...acc, cat];
    }, [] as typeof categoryArray);
    
    response.status(200).json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    response.status(500).json({ error: "Failed to fetch categories" });
  }
}
