import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token = process.env.SANITY_API_TOKEN || "";

if (!projectId || !token) {
  throw new Error("Missing Sanity configuration. Ensure project ID and token are set in env files.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

type CsvProduct = {
  productName: string;
  size: string;
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function parseCsv(filePath: string): CsvProduct[] {
  const raw = readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.slice(1).map((line) => {
    const commaIndex = line.indexOf(",");
    if (commaIndex < 0) {
      return { productName: line, size: "" };
    }

    const productName = line.slice(0, commaIndex).trim();
    const size = line.slice(commaIndex + 1).trim();
    return { productName, size };
  }).filter((row) => row.productName && row.size);
}

async function deleteByType(type: "product" | "review" | "order") {
  const ids = await client.fetch<string[]>(`*[_type == $type][]._id`, { type });
  if (!ids.length) {
    console.log(`No ${type} documents found.`);
    return;
  }

  const chunkSize = 100;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    let tx = client.transaction();
    chunk.forEach((id) => {
      tx = tx.delete(id);
    });
    await tx.commit();
  }

  console.log(`Deleted ${ids.length} ${type} documents.`);
}

async function getOrCreateImportCategoryId(): Promise<string> {
  const existing = await client.fetch<string | null>(
    `*[_type == "category" && slug.current == "imported-products"][0]._id`
  );

  if (existing) {
    return existing;
  }

  const created = await client.create({
    _type: "category",
    title: "Imported Products",
    slug: { _type: "slug", current: "imported-products" },
  });

  console.log("Created category: Imported Products");
  return created._id;
}

async function importProducts(csvProducts: CsvProduct[], categoryId: string) {
  const chunkSize = 80;
  let totalCreated = 0;

  for (let i = 0; i < csvProducts.length; i += chunkSize) {
    const chunk = csvProducts.slice(i, i + chunkSize);
    let tx = client.transaction();

    chunk.forEach((row, index) => {
      const title = `${row.productName} ${row.size}`.trim();
      const slug = toSlug(`${row.productName}-${row.size}-${i + index}`);

      tx = tx.create({
        _type: "product",
        title,
        slug: { _type: "slug", current: slug },
        price: 1000,
        stock: 50,
        inStock: true,
        featured: false,
        rating: 0,
        badge: "",
        description: `Size: ${row.size}`,
        category: {
          _type: "reference",
          _ref: categoryId,
        },
      });
    });

    await tx.commit();
    totalCreated += chunk.length;
  }

  console.log(`Imported ${totalCreated} products from CSV.`);
}

async function main() {
  const csvPath = resolve(process.cwd(), "Book(Sheet1).csv");
  const csvProducts = parseCsv(csvPath);

  console.log(`Parsed ${csvProducts.length} CSV rows.`);

  await deleteByType("review");
  await deleteByType("order");
  await deleteByType("product");

  const categoryId = await getOrCreateImportCategoryId();
  await importProducts(csvProducts, categoryId);

  console.log("Data reset and CSV import completed.");
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
