# Hanniesfood

A modern e-commerce food delivery platform built with Next.js, Sanity CMS, and Paystack payment integration. **Pre-loaded with 22 authentic Nigerian raw food products!** 🍠🥬🌽

## Features

- 🛒 Shopping cart with persistent state
- 💳 **Paystack payment integration** for secure checkout
- 🍠 **22 Nigerian raw food products** pre-loaded (yam, cassava, vegetables, beans, etc.)
- 📦 Product catalog with categories and filtering
- 🔐 Clerk authentication
- 📝 Sanity CMS for content management
- 📊 Admin dashboard for product management
- ⚡ Optimized performance with Next.js 15
- 🎨 Beautiful UI with Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Paystack account ([Sign up here](https://paystack.com))
- Sanity account
- Clerk account (optional, for authentication)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hanniesfood
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your keys:
- **Paystack**: Get your public key from [Paystack Dashboard](https://dashboard.paystack.com/settings/developer)
- **Sanity**: Get your project ID and tokens
- **Clerk**: Get your authentication keys (optional)
- **Admin**: Set a secure password for the admin panel

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Payment Integration

This app uses **Paystack** for secure payment processing. See [PAYSTACK_INTEGRATION.md](./PAYSTACK_INTEGRATION.md) for detailed setup instructions.

### Quick Paystack Setup:

1. Get your public key from [Paystack Dashboard](https://dashboard.paystack.com/settings/developer)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
   ```
3. Test with Paystack test cards (see integration guide)

## Project Structure

```
├── components/          # React components
│   ├── PaystackCheckout.tsx   # Payment integration
│   ├── ProductCard.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── usePaystack.ts  # Paystack hook
│   └── ...
├── pages/              # Next.js pages
│   ├── cart.tsx        # Shopping cart with checkout
│   ├── index.tsx
│   └── api/           # API routes
├── store/              # Zustand state management
│   └── cart.ts         # Cart state
├── sanity/             # Sanity CMS schemas
└── styles/             # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Admin Panel

Access the admin panel at `/admin` to:
- View sales analytics
- Manage products
- Configure settings

Default password can be set in `.env.local` with `ADMIN_PASSWORD`

## Nigerian Raw Foods

This app comes **pre-loaded with 22 authentic Nigerian raw food products** across 6 categories:

- **Tubers & Roots**: Yam (white & yellow), Cassava, Sweet Potato, Cocoyam
- **Vegetables**: Ugwu, Waterleaf, Scent Leaf, Bitter Leaf, Garden Egg, Tomatoes, Peppers
- **Grains & Cereals**: Ofada Rice, Maize, Guinea Corn
- **Legumes & Beans**: Brown Beans, White Beans, Groundnuts
- **Spices & Seasonings**: Cameroon Pepper, Locust Beans, Ogbono
- **Fruits**: Plantain

### Managing Products:

- **View products**: See [NIGERIAN_FOODS_ADDED.md](./NIGERIAN_FOODS_ADDED.md) for complete list
- **Add images**: Follow [IMAGE_SOURCES.md](./IMAGE_SOURCES.md) for image guidelines
- **Bulk image upload**: `npm run upload:images` (after adding images to `public/product-images/`)
- **Re-populate**: `npm run populate:foods` (creates all products again)

## Documentation

- [Nigerian Foods Product List](./NIGERIAN_FOODS_ADDED.md)
- [Image Sources & Upload Guide](./IMAGE_SOURCES.md)
- [Paystack Integration Guide](./PAYSTACK_INTEGRATION.md)
- [Performance Optimizations](./PERFORMANCE_OPTIMIZATIONS.md)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **CMS**: Sanity
- **Authentication**: Clerk
- **Payment**: Paystack
- **Icons**: Lucide React, React Icons

## License

MIT

