import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@sanity/client';
import { getAuth } from '@clerk/nextjs/server';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    return res.status(500).json({
      message: 'Server misconfigured: Sanity project configuration is missing',
    });
  }

  try {
    res.setHeader('Cache-Control', 'no-store');
    const orders = await client.fetch(
      `*[_type == "order" && userId == $userId] | order(createdAt desc){
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
        createdAt
      }`,
      { userId }
    );

    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return res.status(500).json({
      message: 'Error fetching orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
