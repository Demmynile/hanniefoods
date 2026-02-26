import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!process.env.SANITY_API_TOKEN) {
    return res.status(500).json({
      message: 'Server misconfigured: SANITY_API_TOKEN is missing',
    });
  }

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    return res.status(500).json({
      message: 'Server misconfigured: Sanity project configuration is missing',
    });
  }

  try {
    const {
      orderNumber,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      paystackReference,
    } = req.body;

    // Validate required fields
    if (!orderNumber || !customerName || !customerEmail || !items || totalAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    // Update stock for each product
    for (const item of items) {
      const product = await client.fetch(
        `*[_type == "product" && _id == $productId][0]{ _id, stock }`,
        { productId: item.productId }
      );

      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.title}` 
        });
      }

      const newStock = product.stock - item.quantity;

      if (newStock < 0) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.title}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      // Update stock
      await client
        .patch(product._id)
        .set({ 
          stock: newStock,
          inStock: newStock > 0,
        })
        .commit();
    }

    // Create order record
    const order = await client.create({
      _type: 'order',
      orderNumber,
      userId: userId || null,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      items,
      totalAmount,
      paystackReference,
      paymentStatus: 'success',
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Order created and stock updated',
      order,
    });
  } catch (error) {
    console.error('Order processing error:', error);
    return res.status(500).json({
      message: 'Error processing order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
