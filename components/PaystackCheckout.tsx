import { usePaystack, type PaystackConfig, type PaystackResponse } from '@/hooks/usePaystack';
import { useCartStore, selectCartTotal } from '@/store/cart';
import { toast } from 'sonner';

interface PaystackCheckoutProps {
  email: string;
  name?: string;
  phone?: string;
}

export default function PaystackCheckout({ email, name, phone }: PaystackCheckoutProps) {
  const { loaded, initializePayment } = usePaystack();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const total = selectCartTotal(items);

  const handleCheckout = () => {
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
      callback: (response: PaystackResponse) => {
        if (response.status === 'success') {
          toast.success('Payment successful! Thank you for your order.');
          // Clear cart after successful payment
          clear();
          // You can add additional logic here like:
          // - Send order confirmation email
          // - Create order record in your database
          // - Redirect to order confirmation page
          console.log('Payment successful:', response);
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
    <button
      onClick={handleCheckout}
      disabled={!loaded || items.length === 0}
      className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loaded ? 'Checkout with Paystack' : 'Loading payment...'}
    </button>
  );
}
