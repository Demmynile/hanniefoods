import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@sanity/client";
import { getAuth } from "@clerk/nextjs/server";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let userId: string | null = null;

  try {
    const authResult = getAuth(req);
    userId = authResult.userId;
  } catch (error) {
    const sessionToken = req.cookies["__session"] || req.cookies["__clerk_db_jwt"];
    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated - please sign in" });
    }
  }

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated - please sign in" });
  }

  if (!process.env.SANITY_API_TOKEN) {
    return res.status(500).json({ error: "Sanity API token is missing" });
  }

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    return res.status(500).json({ error: "Sanity project configuration is missing" });
  }

  if (req.method === "GET") {
    try {
      const orders = await client.fetch(
        `*[_type == "order"] | order(createdAt desc){
          _id,
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          items,
          totalAmount,
          paymentStatus,
          orderStatus,
          paystackReference,
          createdAt,
          userId
        }`
      );

      return res.status(200).json({ orders });
    } catch (error) {
      console.error("Admin orders fetch error:", error);
      return res.status(500).json({
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { id, orderStatus, paymentStatus } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      if (!orderStatus && !paymentStatus) {
        return res.status(400).json({ error: "No updates provided" });
      }

      const updates: Record<string, string> = {};
      if (orderStatus) updates.orderStatus = orderStatus;
      if (paymentStatus) updates.paymentStatus = paymentStatus;

      const updated = await client
        .patch(id)
        .set(updates)
        .commit();

      return res.status(200).json({ message: "Order updated", order: updated });
    } catch (error) {
      console.error("Admin order update error:", error);
      return res.status(500).json({
        error: "Failed to update order",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
