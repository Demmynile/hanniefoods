import { createClient } from '@sanity/client';
import type { SanityClient } from '@sanity/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import * as https from 'https';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const client: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Authentic Nigerian food images from Pexels (specifically food/vegetables from Nigeria/West Africa)
const NIGERIAN_FOOD_IMAGE_URLS: Record<string, string> = {
  'white-yam-puna-yam-': 'https://images.pexels.com/photos/5966430/pexels-photo-5966430.jpeg?auto=compress&cs=tinysrgb&w=800',
  'yellow-yam-isu-ewura-': 'https://images.pexels.com/photos/8844892/pexels-photo-8844892.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cassava-fresh-': 'https://images.pexels.com/photos/7363674/pexels-photo-7363674.jpeg?auto=compress&cs=tinysrgb&w=800',
  'sweet-potato-orange-': 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cocoyam-ede-': 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=800',
  'ugwu-pumpkin-leaves-': 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=800',
  'waterleaf-gbure-': 'https://images.pexels.com/photos/1359325/pexels-photo-1359325.jpeg?auto=compress&cs=tinysrgb&w=800',
  'scent-leaf-nchuanwu-': 'https://images.pexels.com/photos/4198018/pexels-photo-4198018.jpeg?auto=compress&cs=tinysrgb&w=800',
  'bitter-leaf': 'https://images.pexels.com/photos/5945596/pexels-photo-5945596.jpeg?auto=compress&cs=tinysrgb&w=800',
  'garden-egg-igba-': 'https://images.pexels.com/photos/4828333/pexels-photo-4828333.jpeg?auto=compress&cs=tinysrgb&w=800',
  'local-rice-ofada-rice-': 'https://images.pexels.com/photos/7363641/pexels-photo-7363641.jpeg?auto=compress&cs=tinysrgb&w=800',
  'yellow-maize-corn-': 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=800',
  'guinea-corn-dawa-': 'https://images.pexels.com/photos/8844870/pexels-photo-8844870.jpeg?auto=compress&cs=tinysrgb&w=800',
  'brown-beans': 'https://images.pexels.com/photos/4033318/pexels-photo-4033318.jpeg?auto=compress&cs=tinysrgb&w=800',
  'white-beans-oloyin-': 'https://images.pexels.com/photos/4198925/pexels-photo-4198925.jpeg?auto=compress&cs=tinysrgb&w=800',
  'groundnuts-peanuts-': 'https://images.pexels.com/photos/4033320/pexels-photo-4033320.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cameroon-pepper-nsukka-pepper-': 'https://images.pexels.com/photos/2889348/pexels-photo-2889348.jpeg?auto=compress&cs=tinysrgb&w=800',
  'locust-beans-iru-dawadawa-': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=800',
  'ogbono-seeds-wild-mango-': 'https://images.pexels.com/photos/5966653/pexels-photo-5966653.jpeg?auto=compress&cs=tinysrgb&w=800',
  'fresh-tomatoes-local-': 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
  'fresh-pepper-scotch-bonnet-': 'https://images.pexels.com/photos/6824346/pexels-photo-6824346.jpeg?auto=compress&cs=tinysrgb&w=800',
  'plantain-unripe-': 'https://images.pexels.com/photos/5966459/pexels-photo-5966459.jpeg?auto=compress&cs=tinysrgb&w=800',
};

/**
 * Download image from URL and save to disk
 */
async function downloadImage(url: string, filepath: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          downloadImage(response.headers.location, filepath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.log(`  ✗ HTTP ${response.statusCode}`);
        resolve(false);
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Verify it's an actual image (check magic bytes)
        const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
        const isWEBP = buffer[8] === 0x57 && buffer[9] === 0x45;
        
        if (!isJPEG && !isPNG && !isWEBP) {
          console.log(`  ✗ Invalid image data`);
          resolve(false);
          return;
        }
        
        writeFileSync(filepath, buffer);
        resolve(true);
      });
      response.on('error', () => {
        resolve(false);
      });
    }).on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Download image from direct URL
 */
async function downloadImageFromUrl(url: string, filename: string): Promise<string | null> {
  try {
    const tempDir = resolve(__dirname, '../temp-images');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const imagePath = resolve(tempDir, filename);
    
    const success = await downloadImage(url, imagePath);
    
    if (success) {
      console.log(`  ✓ Downloaded: ${filename}`);
      return imagePath;
    } else {
      console.log(`  ✗ Failed to download ${filename}`);
      return null;
    }
  } catch (error) {
    console.error(`  ✗ Error downloading ${filename}:`, error);
    return null;
  }
}

/**
 * Upload image to Sanity from file path
 */
async function uploadImageToSanity(imagePath: string, filename: string): Promise<string | null> {
  try {
    const fs = await import('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    
    const asset = await client.assets.upload('image', imageBuffer, {
      filename,
    });
    
    console.log(`  ✓ Uploaded to Sanity: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error(`  ✗ Error uploading to Sanity:`, error);
    return null;
  }
}

/**
 * Update product with image
 */
async function updateProductWithImage(productSlug: string, imageAssetId: string, productTitle: string): Promise<void> {
  try {
    const products = await client.fetch(
      `*[_type == "product" && slug.current == $slug]`,
      { slug: productSlug }
    );

    if (products.length === 0) {
      console.log(`  ⚠️  Product not found: ${productSlug}`);
      return;
    }

    const product = products[0];
    
    // Update the product with the image
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

    // Publish the changes
    await client
      .patch(product._id)
      .set({ _updatedAt: new Date().toISOString() })
      .commit();

    console.log(`  ✓ Updated product: ${productTitle}\n`);
  } catch (error) {
    console.error(`  ✗ Error updating product ${productSlug}:`, error);
  }
}

/**
 * Add a delay to avoid rate limiting
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main function
 */
async function main() {
  console.log('\n🇳🇬 Nigerian Foods Image Upload Tool\n');
  console.log('================================================\n');
  console.log('This script will:');
  console.log('1. Download real Nigerian/African food images from Pexels');
  console.log('2. Upload them to Sanity');
  console.log('3. Associate them with your products\n');
  console.log('================================================\n');

  try {
    let successCount = 0;
    let failCount = 0;
    const total = Object.keys(NIGERIAN_FOOD_IMAGE_URLS).length;

    for (const [productSlug, imageUrl] of Object.entries(NIGERIAN_FOOD_IMAGE_URLS)) {
      console.log(`[${successCount + failCount + 1}/${total}] Processing: ${productSlug}`);
      
      // 1. Download image from URL
      const filename = `${productSlug}.jpg`;
      const imagePath = await downloadImageFromUrl(imageUrl, filename);
      
      if (!imagePath) {
        failCount++;
        console.log(`  ✗ Failed to download image\n`);
        continue;
      }

      // 2. Upload to Sanity
      const assetId = await uploadImageToSanity(imagePath, filename);
      
      if (!assetId) {
        failCount++;
        console.log(`  ✗ Failed to upload to Sanity\n`);
        continue;
      }

      // 3. Get product title for better logging
      const products = await client.fetch(
        `*[_type == "product" && slug.current == $slug]`,
        { slug: productSlug }
      );
      
      const productTitle = products[0]?.title || productSlug;

      // 4. Update product
      await updateProductWithImage(productSlug, assetId, productTitle);
      
      successCount++;

      // Add a small delay to avoid rate limiting
      await delay(500);
    }

    console.log('\n================================================');
    console.log(`✅ Complete! ${successCount} products updated successfully`);
    if (failCount > 0) {
      console.log(`⚠️  ${failCount} products failed`);
    }
    console.log('================================================\n');
    console.log('💡 Tip: Check your Sanity Studio to see the new images!');
    console.log(`   Visit: http://localhost:3000/studio\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
