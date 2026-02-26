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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // Get reviews - no auth required
    if (req.method === 'GET') {
      const { productId } = req.query;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      try {
        const reviews = await client.fetch(
          `*[_type == "review" && product._ref == $productId] | order(createdAt desc) {
            _id,
            userName,
            rating,
            comment,
            createdAt,
            verified
          }`,
          { productId }
        );

        const averageRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
          : 0;

        return res.status(200).json({
          reviews,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: reviews.length,
        });
      } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
    }

    // Post review - requires auth
    if (req.method === 'POST') {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { productId, rating, comment, userName, userEmail } = req.body;

      if (!productId || !rating || !comment || !userName) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      const trimmedComment = comment.trim();
      if (trimmedComment.length < 10 || trimmedComment.length > 1000) {
        return res.status(400).json({ message: 'Comment must be 10-1000 characters' });
      }

      try {
        // Check for existing review
        const existing = await client.fetch(
          `*[_type == "review" && userId == $userId && product._ref == $productId][0]`,
          { userId, productId }
        );

        if (existing) {
          return res.status(400).json({ message: 'You already reviewed this product' });
        }

        // Create review
        const review = await client.create({
          _type: 'review',
          product: {
            _type: 'reference',
            _ref: productId,
          },
          userId,
          userName,
          userEmail: userEmail || null,
          rating,
          comment: trimmedComment,
          createdAt: new Date().toISOString(),
          verified: false,
        });

        // Update product rating asynchronously (fire and forget)
        client.fetch(
          `*[_type == "review" && product._ref == $productId]{ rating }`,
          { productId }
        ).then((allReviews: any[]) => {
          if (allReviews.length > 0) {
            const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            client.patch(productId)
              .set({ rating: Math.round(avg * 10) / 10 })
              .commit()
              .catch(err => console.error('Rating update failed:', err));
          }
        }).catch(err => console.error('Review fetch failed:', err));

        return res.status(201).json({
          success: true,
          message: 'Review submitted',
          review,
        });
      } catch (error) {
        console.error('Review creation error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ message: `Failed to create review: ${msg}` });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: `Server error: ${msg}` });
  }
}
