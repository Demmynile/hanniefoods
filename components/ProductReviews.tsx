import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isLoaded } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews for product:', productId);
      const response = await fetch(`/api/reviews/${productId}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', { 
          status: response.status,
          contentType,
          text: text.substring(0, 200)
        });
        toast.error('Failed to load reviews - server error');
        return;
      }

      const data = await response.json();
      console.log('Reviews response:', response.status, data);

      if (response.ok) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } else {
        console.error('Failed to fetch reviews:', data.message);
        toast.error(data.message || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(error instanceof Error ? error.message : 'Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (formData.comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    if (formData.comment.trim().length > 1000) {
      toast.error('Review must be less than 1000 characters');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Submitting review for product:', productId);
      console.log('User:', user?.id, user?.fullName);
      
      const response = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formData.rating,
          comment: formData.comment.trim(),
          userName: user.fullName || user.firstName || 'Anonymous',
          userEmail: user.primaryEmailAddress?.emailAddress,
        }),
      });

      // Check response content type
      const contentType = response.headers.get('content-type');
      
      if (!contentType?.includes('application/json')) {
        const htmlText = await response.text();
        console.error('Non-JSON response from review endpoint:', { 
          status: response.status,
          contentType,
          text: htmlText.substring(0, 500)
        });
        toast.error('Server error: ' + (response.status === 500 ? 'Internal server error' : `HTTP ${response.status}`));
        return;
      }

      const data = await response.json();
      console.log('Review response:', response.status, data);

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setFormData({ rating: 5, comment: '' });
        setShowReviewForm(false);
        // Wait 1 second for backend to process, then fetch fresh reviews
        setTimeout(() => fetchReviews(), 1000);
      } else {
        const errorMessage = data.message || data.details || 'Failed to submit review';
        console.error('Review submission failed:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={() => interactive && onChange?.(star)}
            disabled={!interactive}
            className={`${
              star <= rating ? 'text-yellow-500' : 'text-stone-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''} transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-stone-200 rounded w-1/4"></div>
          <div className="h-20 bg-stone-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-stone-900">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-2">{renderStars(Math.round(averageRating))}</div>
            <div className="mt-2 text-sm text-stone-600">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          
          {isLoaded && user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="ml-auto rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
          
          {isLoaded && !user && (
            <div className="ml-auto text-sm text-stone-600">
              Sign in to write a review
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-stone-900">Write Your Review</h3>
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Your Rating
            </label>
            {renderStars(formData.rating, true, (rating) =>
              setFormData({ ...formData, rating })
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Your Review
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
              placeholder="Share your experience with this product..."
              required
              minLength={10}
              maxLength={1000}
            />
            <div className="mt-1 text-xs text-stone-500">
              {formData.comment.length}/1000 characters (minimum 10)
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-stone-900">
          Customer Reviews ({totalReviews})
        </h3>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-8 text-center">
            <p className="text-stone-600">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-stone-900">
                      {review.userName}
                    </div>
                    {review.verified && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    {renderStars(review.rating)}
                    <span className="text-xs text-stone-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-stone-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
