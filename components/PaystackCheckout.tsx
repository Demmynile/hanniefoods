import { usePaystack, type PaystackConfig, type PaystackResponse } from '@/hooks/usePaystack';
import { useCartStore, selectCartTotal } from '@/store/cart';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface PaystackCheckoutProps {
  email: string;
  name?: string;
  phone?: string;
}

export default function PaystackCheckout({ email, name, phone }: PaystackCheckoutProps) {
  const { user } = useUser();
  const { loaded, initializePayment, error } = usePaystack();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const total = selectCartTotal(items);

  const handleCheckout = () => {
    if (error) {
      toast.error(error || 'Payment system error. Please try again.');
      return;
    }

    if (!email) {
      toast.error('Please provide your email address');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      toast.error('Payment system not configured. Please contact support.');
      console.error('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set');
      return;
    }

    // Convert total to kobo (Paystack expects amount in kobo for NGN)
    // Multiply by 100 to convert from Naira to Kobo
    const amountInKobo = Math.round(total * 100);

    const config: PaystackConfig = {
      key: publicKey,
      email,
      amount: amountInKobo,
      currency: 'NGN',
      ref: `HANNIESFOOD_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: name || 'Guest',
          },
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
            value: phone || 'N/A',
          },
          {
            display_name: 'Cart Items',
            variable_name: 'cart_items',
            value: items.map(item => `${item.product.title} x${item.quantity}`).join(', '),
          },
        ],
        cart_items: items.map(item => ({
          id: item.product.id,
          title: item.product.title,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
      callback: async (response: PaystackResponse) => {
        if (response.status === 'success') {
          try {
            // Create order and update stock
            const orderResponse = await fetch('/api/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderNumber: response.reference,
                customerName: name || 'Guest',
                customerEmail: email,
                customerPhone: phone || null,
                items: items.map(item => ({
                  productId: item.product.id,
                  title: item.product.title,
                  price: item.product.price,
                  quantity: item.quantity,
                })),
                totalAmount: total,
                paystackReference: response.reference,
              }),
            });

            const contentType = orderResponse.headers.get('content-type') || '';
            const orderData = contentType.includes('application/json')
              ? await orderResponse.json()
              : null;

            if (!contentType.includes('application/json')) {
              const rawText = await orderResponse.text();
              throw new Error(`Order API error (${orderResponse.status}): ${rawText.slice(0, 200)}`);
            }

            if (orderResponse.ok) {
              toast.success('Payment successful! Thank you for your order.');
              clear();
              console.log('Order created:', orderData);
            } else {
              toast.error(orderData.message || 'Order processing failed');
              console.error('Order creation failed:', orderData);
            }
          } catch (error) {
            console.error('Error processing order:', error);
            const message = error instanceof Error
              ? error.message
              : 'Payment successful but order processing failed. Please contact support.';
            toast.error(message);
          }
        } else {
          toast.error('Payment was not completed');
        }
      },
      onClose: () => {
        toast.info('Payment window closed');
      },
    };

    initializePayment(config);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCheckout}
        disabled={!loaded || items.length === 0 || !!error}
        className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {error ? 'Payment Error - Try Refreshing' : loaded ? `Pay ₦${total.toLocaleString()}` : 'Loading payment system...'}
      </button>
      
      {!loaded && !error && (
        <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900"></div>
          <span>Connecting to payment gateway...</span>
        </div>
      )}
      
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">{error}</p>
              <div className="mt-2 text-xs text-red-800 space-y-1">
                <p className="font-medium">Troubleshooting steps:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>Check your internet connection</li>
                  <li>Disable browser extensions (especially ad blockers)</li>
                  <li>Try refreshing the page</li>
                  <li>Try a different browser or device</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-xs font-semibold text-red-700 hover:text-red-900 underline"
              >
                Refresh page now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
