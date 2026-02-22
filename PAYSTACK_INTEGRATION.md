# Paystack Integration Guide

This guide explains how to set up and use the Paystack payment integration in Hanniesfood.

## Setup Instructions

### 1. Get Your Paystack API Keys

1. Sign up or log in to your [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### 2. Configure Environment Variables

Open the `.env.local` file in your project root and replace the placeholder with your actual Paystack public key:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
```

**Important:** 
- Use `pk_test_` keys for development/testing
- Use `pk_live_` keys only in production
- Never commit your `.env.local` file to version control

### 3. How It Works

The Paystack integration is implemented using the Paystack Inline JS library, which provides a popup payment modal. Here's the flow:

1. **Cart Page** (`/cart`): Customer adds items and fills in their information
   - Email (required)
   - Name (optional)
   - Phone (optional)

2. **Checkout Button**: When clicked, the Paystack payment modal opens
   - Amount is automatically converted to Kobo (NGN subunit)
   - Order details are included in metadata
   - Unique reference is generated for each transaction

3. **Payment Processing**: Customer completes payment in the Paystack modal
   - Supports cards, bank transfers, USSD, and more
   - Secure payment processing by Paystack

4. **Payment Callback**: After successful payment
   - Cart is automatically cleared
   - Success message is displayed
   - Transaction reference is logged

## Files Created/Modified

### New Files:
- `hooks/usePaystack.ts` - Custom hook to load and initialize Paystack
- `components/PaystackCheckout.tsx` - Checkout button component

### Modified Files:
- `pages/cart.tsx` - Added customer information form and Paystack integration
- `.env.local` - Added Paystack public key configuration

## Testing the Integration

### Test Mode (Development):

1. Make sure you're using a `pk_test_` key in `.env.local`
2. Add items to cart and navigate to `/cart`
3. Fill in customer email (required field)
4. Click "Checkout with Paystack"
5. Use Paystack test cards:
   - **Successful payment**: `4084 0840 8408 4081` (CVV: 408, PIN: 0000)
   - **Declined payment**: `5060 6666 6666 6666` (any CVV/PIN)

### Webhooks (Optional):

For production use, you should set up webhooks to verify payments server-side:

1. Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. Add your webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Create the webhook handler in `pages/api/webhooks/paystack.ts`

## Currency Configuration

Currently configured for **Nigerian Naira (NGN)**. To change currency:

1. Open `components/PaystackCheckout.tsx`
2. Modify the `currency` field in the config object
3. Adjust the amount calculation (kobo conversion) if needed

Supported currencies: NGN, GHS, ZAR, USD

## Customization

### Modify Payment Metadata

Edit `components/PaystackCheckout.tsx` to add more custom fields:

```typescript
metadata: {
  custom_fields: [
    {
      display_name: 'Delivery Address',
      variable_name: 'delivery_address',
      value: deliveryAddress,
    },
    // Add more fields...
  ],
}
```

### Post-Payment Actions

Add your custom logic in the `callback` function:

```typescript
callback: (response: PaystackResponse) => {
  if (response.status === 'success') {
    // Clear cart
    clear();
    
    // Send order confirmation email
    // Create order in database
    // Redirect to order confirmation page
    // etc.
  }
}
```

## Security Notes

- Never expose your Paystack Secret Key in client-side code
- Always verify payments on the server side for production
- Use HTTPS in production
- Implement proper webhook signature verification

## Troubleshooting

**Payment modal not opening:**
- Check browser console for errors
- Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set correctly
- Ensure no ad blockers are blocking Paystack scripts

**"Payment system not configured" error:**
- Restart your dev server after adding the environment variable
- Check that the key starts with `pk_test_` or `pk_live_`

**Amount issues:**
- Paystack expects amounts in kobo for NGN (1 NGN = 100 kobo)
- The integration automatically multiplies by 100

## Support

For Paystack-specific issues, refer to:
- [Paystack Documentation](https://paystack.com/docs/)
- [Paystack Support](https://paystack.com/contact)
