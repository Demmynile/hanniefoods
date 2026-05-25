import { createClient } from '@sanity/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function run() {
  const ids = await client.fetch<string[]>(
    '*[_type == "product" && (price <= 0 || stock <= 0)][]._id'
  );

  console.log('products to patch:', ids.length);

  const chunkSize = 80;
  for (let i = 0; i < ids.length; i += chunkSize) {
    let tx = client.transaction();
    ids.slice(i, i + chunkSize).forEach((id) => {
      tx = tx.patch(id, { set: { price: 1000, stock: 50, inStock: true } });
    });
    await tx.commit();
  }

  console.log('patched');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
