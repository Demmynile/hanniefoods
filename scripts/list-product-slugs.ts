import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function listProductSlugs() {
  const products = await client.fetch(`*[_type == "product"]{title, "slug": slug.current}`);
  console.log('\n📋 Products in your database:\n');
  products.forEach((product: { title: string; slug: string }) => {
    console.log(`  "${product.slug}": "${product.title}"`);
  });
  console.log(`\n Total: ${products.length} products\n`);
}

listProductSlugs();
