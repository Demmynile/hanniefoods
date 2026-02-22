import { createClient } from '@sanity/client';
import type { SanityClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const client: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Nigerian raw food categories
const categories = [
  { title: 'Tubers & Roots', slug: 'tubers-roots' },
  { title: 'Vegetables', slug: 'vegetables' },
  { title: 'Grains & Cereals', slug: 'grains-cereals' },
  { title: 'Legumes & Beans', slug: 'legumes-beans' },
  { title: 'Spices & Seasonings', slug: 'spices-seasonings' },
  { title: 'Fruits', slug: 'fruits' },
];

// Nigerian raw food products with image URLs
const products = [
  {
    title: 'White Yam (Puna Yam)',
    price: 2500,
    category: 'tubers-roots',
    description: 'Premium quality white yam, perfect for pounded yam, yam porridge (asaro), or boiled yam. Fresh from local farms.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
    featured: true,
    rating: 4.8,
    stock: 50,
    badge: 'Fresh',
  },
  {
    title: 'Yellow Yam (Isu Ewura)',
    price: 2000,
    category: 'tubers-roots',
    description: 'Sweet yellow yam variety, excellent for frying, roasting, or making yam porridge. Rich in nutrients.',
    imageUrl: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800',
    featured: false,
    rating: 4.6,
    stock: 35,
  },
  {
    title: 'Cassava (Fresh)',
    price: 800,
    category: 'tubers-roots',
    description: 'Fresh cassava tubers, ideal for making garri, fufu, or cassava flour. Peeled on request.',
    imageUrl: 'https://images.unsplash.com/photo-1595426274148-1f0bb7b17b50?w=800',
    featured: false,
    rating: 4.5,
    stock: 100,
  },
  {
    title: 'Sweet Potato (Orange)',
    price: 1200,
    category: 'tubers-roots',
    description: 'Fresh orange-fleshed sweet potatoes. Rich in vitamin A, perfect for porridge, fries, or roasting.',
    imageUrl: 'https://images.unsplash.com/photo-1629640008062-aec49b0d0b65?w=800',
    featured: true,
    rating: 4.7,
    stock: 60,
    badge: 'Popular',
  },
  {
    title: 'Cocoyam (Ede)',
    price: 1500,
    category: 'tubers-roots',
    description: 'Fresh cocoyam corms, great for making cocoyam porridge or fufu. Smooth texture when cooked.',
    imageUrl: 'https://images.unsplash.com/photo-1584608964555-3e0b769dfc2c?w=800',
    featured: false,
    rating: 4.4,
    stock: 40,
  },
  {
    title: 'Ugwu (Pumpkin Leaves)',
    price: 500,
    category: 'vegetables',
    description: 'Fresh fluted pumpkin leaves (Ugwu). Perfect for edikang ikong, egusi soup, or vegetable sauce. Bunched and fresh.',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
    featured: true,
    rating: 4.9,
    stock: 80,
    badge: 'Best Seller',
  },
  {
    title: 'Waterleaf (Gbure)',
    price: 400,
    category: 'vegetables',
    description: 'Fresh waterleaf for preparing traditional Nigerian soups. Washed and ready to cook.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    featured: false,
    rating: 4.6,
    stock: 70,
  },
  {
    title: 'Scent Leaf (Nchuanwu)',
    price: 300,
    category: 'vegetables',
    description: 'Aromatic scent leaves (basil) for pepper soup, nkwobi, and traditional dishes. Fresh bunches.',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=800',
    featured: false,
    rating: 4.7,
    stock: 90,
  },
  {
    title: 'Bitter Leaf',
    price: 600,
    category: 'vegetables',
    description: 'Fresh bitter leaves, pre-washed to reduce bitterness. Essential for ofe onugbu and other traditional soups.',
    imageUrl: 'https://images.unsplash.com/photo-1554998171-89445e31c52b?w=800',
    featured: false,
    rating: 4.5,
    stock: 50,
  },
  {
    title: 'Garden Egg (Igba)',
    price: 800,
    category: 'vegetables',
    description: 'Fresh white garden eggs. Great for sauce or eaten raw with groundnuts. Rich in antioxidants.',
    imageUrl: 'https://images.unsplash.com/photo-1616480946049-ba7e70c1a7be?w=800',
    featured: false,
    rating: 4.4,
    stock: 45,
  },
  {
    title: 'Local Rice (Ofada Rice)',
    price: 3500,
    category: 'grains-cereals',
    description: 'Unpolished brown Ofada rice, 5kg bag. Aromatic local variety perfect for Ofada stew. Stone-free.',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
    featured: true,
    rating: 4.8,
    stock: 30,
    badge: 'Premium',
  },
  {
    title: 'Yellow Maize (Corn)',
    price: 2000,
    category: 'grains-cereals',
    description: 'Dried yellow maize, 5kg. Perfect for making pap (akamu), cornmeal, or popcorn. Farm fresh.',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800',
    featured: false,
    rating: 4.5,
    stock: 55,
  },
  {
    title: 'Guinea Corn (Dawa)',
    price: 1800,
    category: 'grains-cereals',
    description: 'Premium guinea corn grains. Great for making kunu drink or traditional porridge. Gluten-free.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    featured: false,
    rating: 4.3,
    stock: 40,
  },
  {
    title: 'Brown Beans',
    price: 2800,
    category: 'legumes-beans',
    description: 'High-quality brown beans (honey beans), 5kg bag. Perfect for moi moi, akara, or beans porridge. Fresh harvest.',
    imageUrl: 'https://images.unsplash.com/photo-1596097639286-0f8c6b6a8b1f?w=800',
    featured: true,
    rating: 4.9,
    stock: 65,
    badge: 'Top Quality',
  },
  {
    title: 'White Beans (Oloyin)',
    price: 3200,
    category: 'legumes-beans',
    description: 'Premium white beans, 5kg. Cooks faster than brown beans. Perfect for ewa agoyin or beans and plantain.',
    imageUrl: 'https://images.unsplash.com/photo-1615485925763-0a8eec1e7b4d?w=800',
    featured: false,
    rating: 4.7,
    stock: 50,
  },
  {
    title: 'Groundnuts (Peanuts)',
    price: 1500,
    category: 'legumes-beans',
    description: 'Raw shelled groundnuts, 2kg. For making groundnut soup, kuli kuli, or roasting. Fresh and clean.',
    imageUrl: 'https://images.unsplash.com/photo-1596941248341-e2b8df6c1b0e?w=800',
    featured: false,
    rating: 4.6,
    stock: 70,
  },
  {
    title: 'Cameroon Pepper (Nsukka Pepper)',
    price: 800,
    category: 'spices-seasonings',
    description: 'Dried Cameroon pepper, very hot and aromatic. Essential for authentic Nigerian pepper soup and stews. 200g pack.',
    imageUrl: 'https://images.unsplash.com/photo-1583638201207-c4e1c0f9b40e?w=800',
    featured: false,
    rating: 4.8,
    stock: 85,
  },
  {
    title: 'Locust Beans (Iru/Dawadawa)',
    price: 600,
    category: 'spices-seasonings',
    description: 'Fermented locust beans for traditional soups and stews. Strong aroma, authentic flavor. 150g pack.',
    imageUrl: 'https://images.unsplash.com/photo-1505253468034-514d2507d914?w=800',
    featured: false,
    rating: 4.5,
    stock: 60,
  },
  {
    title: 'Ogbono Seeds (Wild Mango)',
    price: 1200,
    category: 'spices-seasonings',
    description: 'Ground ogbono seeds for making draw soup. Pre-ground for convenience. 500g pack.',
    imageUrl: 'https://images.unsplash.com/photo-1566393972030-dabd1e4a5e67?w=800',
    featured: true,
    rating: 4.7,
    stock: 55,
    badge: 'Ready to Use',
  },
  {
    title: 'Fresh Tomatoes (Local)',
    price: 1000,
    category: 'vegetables',
    description: 'Fresh red tomatoes from local farms. Perfect for stews, jollof rice, and sauces. 3kg basket.',
    imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800',
    featured: true,
    rating: 4.6,
    stock: 75,
    badge: 'Farm Fresh',
  },
  {
    title: 'Fresh Pepper (Scotch Bonnet)',
    price: 800,
    category: 'vegetables',
    description: 'Very hot fresh scotch bonnet peppers (atarodo). Perfect for pepper sauce and stews. 1kg.',
    imageUrl: 'https://images.unsplash.com/photo-1536857339206-7b8dc6d7eb31?w=800',
    featured: false,
    rating: 4.8,
    stock: 90,
  },
  {
    title: 'Plantain (Unripe)',
    price: 1200,
    category: 'fruits',
    description: 'Fresh unripe plantains, bunch of 4-6 fingers. Perfect for plantain porridge, chips, or dodo.',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800',
    featured: true,
    rating: 4.9,
    stock: 100,
    badge: 'Always Fresh',
  },
];

async function createCategories() {
  console.log('Creating categories...');
  const categoryRefs: Record<string, string> = {};

  for (const cat of categories) {
    try {
      const category = await client.create({
        _type: 'category',
        title: cat.title,
        slug: { _type: 'slug', current: cat.slug },
      });
      categoryRefs[cat.slug] = category._id;
      console.log(`✓ Created category: ${cat.title}`);
    } catch (error) {
      console.error(`✗ Error creating category ${cat.title}:`, error);
    }
  }

  return categoryRefs;
}

async function uploadImageFromUrl(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename,
    });
    return asset._id;
  } catch (error) {
    console.error(`Error uploading image from ${url}:`, error);
    return null;
  }
}

async function createProducts(categoryRefs: Record<string, string>) {
  console.log('\nCreating products...');

  for (const product of products) {
    try {
      // Upload image
      console.log(`Uploading image for ${product.title}...`);
      const imageAssetId = await uploadImageFromUrl(
        product.imageUrl,
        `${product.title.toLowerCase().replace(/\s+/g, '-')}.jpg`
      );

      // Create product
      await client.create({
        _type: 'product',
        title: product.title,
        slug: {
          _type: 'slug',
          current: product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
        price: product.price,
        category: {
          _type: 'reference',
          _ref: categoryRefs[product.category],
        },
        description: product.description,
        featured: product.featured,
        rating: product.rating,
        stock: product.stock,
        inStock: true,
        badge: product.badge,
        ...(imageAssetId && {
          images: [
            {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: imageAssetId,
              },
            },
          ],
        }),
      });

      console.log(`✓ Created product: ${product.title} (₦${product.price})`);
    } catch (error) {
      console.error(`✗ Error creating product ${product.title}:`, error);
    }
  }
}

async function main() {
  console.log('🍠 Starting Nigerian Raw Foods Population Script\n');
  console.log('================================================\n');

  try {
    // Step 1: Create categories
    const categoryRefs = await createCategories();

    // Wait a bit to ensure categories are indexed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 2: Create products
    await createProducts(categoryRefs);

    console.log('\n================================================');
    console.log('✅ Successfully populated Nigerian raw foods!');
    console.log(`Total categories: ${categories.length}`);
    console.log(`Total products: ${products.length}`);
    console.log('================================================\n');
  } catch (error) {
    console.error('❌ Error running script:', error);
    process.exit(1);
  }
}

main();
