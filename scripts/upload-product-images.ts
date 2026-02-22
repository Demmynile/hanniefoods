import { createClient } from '@sanity/client';
import type { SanityClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, readdirSync } from 'fs';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const client: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Directory containing your product images
const IMAGES_DIR = resolve(__dirname, '../public/product-images');

/**
 * Upload a local image to Sanity
 */
async function uploadImage(filePath: string, filename: string) {
  try {
    const imageBuffer = readFileSync(filePath);
    const asset = await client.assets.upload('image', imageBuffer, {
      filename,
    });
    return asset._id;
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    return null;
  }
}

/**
 * Update a product with an image
 */
async function updateProductImage(productSlug: string, imageAssetId: string) {
  try {
    const products = await client.fetch(
      `*[_type == "product" && slug.current == $slug]`,
      { slug: productSlug }
    );

    if (products.length === 0) {
      console.log(`Product not found: ${productSlug}`);
      return;
    }

    const product = products[0];
    
    await client
      .patch(product._id)
      .set({
        images: [
          {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAssetId,
            },
          },
        ],
      })
      .commit();

    console.log(`✓ Updated image for: ${product.title}`);
  } catch (error) {
    console.error(`Error updating product ${productSlug}:`, error);
  }
}

/**
 * Main function to upload images
 * 
 * Image naming convention:
 * - white-yam.jpg -> updates "white-yam-puna-yam" product
 * - cassava.png -> updates "cassava-fresh" product
 * 
 * The script matches image filenames to product slugs (partial match)
 */
async function main() {
  console.log('📸 Nigerian Foods Image Upload Tool\n');
  console.log('================================================\n');

  try {
    // Check if images directory exists
    try {
      const files = readdirSync(IMAGES_DIR);
      const imageFiles = files.filter((file) =>
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
      );

      if (imageFiles.length === 0) {
        console.log('❌ No images found in:', IMAGES_DIR);
        console.log('\nTo use this script:');
        console.log('1. Create a folder: public/product-images/');
        console.log('2. Add your product images (jpg, png, webp)');
        console.log('3. Name them similar to product names (e.g., white-yam.jpg)');
        console.log('4. Run: npm run upload:images');
        return;
      }

      console.log(`Found ${imageFiles.length} image(s) to upload\n`);

      // Get all products
      const products = await client.fetch(`*[_type == "product"]`);
      console.log(`Found ${products.length} products in database\n`);

      // Upload each image and match to products
      for (const imageFile of imageFiles) {
        const imagePath = resolve(IMAGES_DIR, imageFile);
        const baseName = imageFile.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');

        // Find matching product
        const matchingProduct = products.find((p: { slug: { current: string }; title: string }) =>
          p.slug.current.includes(baseName.toLowerCase()) ||
          baseName.toLowerCase().includes(p.slug.current.split('-')[0])
        );

        if (matchingProduct) {
          console.log(`Uploading ${imageFile} for "${matchingProduct.title}"...`);
          const assetId = await uploadImage(imagePath, imageFile);

          if (assetId) {
            await updateProductImage(matchingProduct.slug.current, assetId);
          }
        } else {
          console.log(`⚠️  No matching product found for: ${imageFile}`);
        }
      }

      console.log('\n================================================');
      console.log('✅ Image upload complete!');
      console.log('================================================\n');
    } catch {
      console.log('❌ Images directory not found:', IMAGES_DIR);
      console.log('\nTo use this script:');
      console.log('1. Create a folder: public/product-images/');
      console.log('2. Add your product images');
      console.log('3. Run: npm run upload:images');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
