import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@sanity/client';
import { getAuth } from '@clerk/nextjs/server';
import { DEFAULT_CURRENCY, type CurrencyCode } from '@/lib/currency';

const SUPPORTED_CURRENCIES: CurrencyCode[] = ['NGN', 'GBP', 'USD', 'CAD', 'AUD'];

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value as CurrencyCode);
}

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
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalAmount,
      currency,
      paystackReference,
    } = req.body;

    const auth = getAuth(req);
    const userId = auth.userId || null;

    // Validate required fields
    if (!orderNumber || !customerName || !customerEmail || !items || totalAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (currency !== undefined && !isCurrencyCode(currency)) {
      return res.status(400).json({
        message: `Invalid currency: ${String(currency)}. Allowed: ${SUPPORTED_CURRENCIES.join(', ')}`,
      });
    }

    const invalidItem = items.find(
      (item) => item.currency !== undefined && !isCurrencyCode(item.currency)
    );
    if (invalidItem) {
      return res.status(400).json({
        message: `Invalid item currency for ${invalidItem.title || 'order item'}: ${String(invalidItem.currency)}. Allowed: ${SUPPORTED_CURRENCIES.join(', ')}`,
      });
    }

    const normalizedCurrency: CurrencyCode = isCurrencyCode(currency) ? currency : DEFAULT_CURRENCY;
    const normalizedItems = items.map((item) => ({
      ...item,
      currency: isCurrencyCode(item.currency) ? item.currency : normalizedCurrency,
    }));

    // Update stock for each product
    for (const item of normalizedItems) {
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
      userId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      currency: normalizedCurrency,
      items: normalizedItems,
      totalAmount,
      paystackReference,
      paymentStatus: 'success',
      orderStatus: 'paid',
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
