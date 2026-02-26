import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@sanity/client';
import { getAuth } from '@clerk/nextjs/server';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: 'published',
});

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set');
}
if (!process.env.SANITY_API_TOKEN) {
  console.error('SANITY_API_TOKEN is not set');
}

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
        console.log('Fetching reviews for productId:', productId);
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
        console.log('Reviews fetched:', reviews.length);

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
        console.log('POST /api/reviews attempting to create review:', { productId, userId, rating, userName });
        
        // Check for existing review
        const existing = await client.fetch(
          `*[_type == "review" && userId == $userId && product._ref == $productId][0]`,
          { userId, productId }
        );

        if (existing) {
          console.log('Existing review found, rejecting duplicate');
          return res.status(400).json({ message: 'You already reviewed this product' });
        }

        // Create review
        console.log('Creating new review document...');
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
        console.log('Review created successfully with ID:', review._id);

        // Update product rating immediately
        try {
          const allReviewsData = await client.fetch(
            `*[_type == "review" && product._ref == $productId]{ rating }`,
            { productId }
          );
          console.log('All reviews for product after creation:', allReviewsData.length);
          
          if (allReviewsData && allReviewsData.length > 0) {
            const avg = allReviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviewsData.length;
            const roundedRating = Math.round(avg * 10) / 10;
            
            await client.patch(productId)
              .set({ rating: roundedRating })
              .commit();
            console.log('Product rating updated to:', roundedRating);
          }
        } catch (err) {
          console.error('Rating update error:', err);
        }

        // Fetch updated reviews to return in response
        console.log('Fetching all reviews for product to return...');
        const updatedReviews = await client.fetch(
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
        console.log('Total reviews fetched after submit:', updatedReviews.length);

        const updatedAverage = updatedReviews.length > 0
          ? updatedReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / updatedReviews.length
          : 0;

        return res.status(201).json({
          success: true,
          message: 'Review submitted',
          review,
          reviews: updatedReviews,
          averageRating: Math.round(updatedAverage * 10) / 10,
          totalReviews: updatedReviews.length,
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
