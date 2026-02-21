import type { NextApiRequest, NextApiResponse } from "next";
import { getProductById } from "@/lib/products";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { id } = request.query;
  const idValue = Array.isArray(id) ? id[0] : id;

  if (!idValue) {
    response.status(400).json({ message: "Missing id" });
    return;
  }

  const product = await getProductById(idValue);
  response.status(200).json(product);
}
