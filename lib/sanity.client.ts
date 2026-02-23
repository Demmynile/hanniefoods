import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

export const sanityConfigured = !!(projectId && dataset);

export const sanityClient = createClient({
  projectId: projectId || "",
  dataset: dataset || "",
  apiVersion,
  useCdn: true, // Use CDN for normal requests
});

export const sanityClientNoCache = createClient({
  projectId: projectId || "",
  dataset: dataset || "",
  apiVersion,
  useCdn: false, // Don't use CDN - get fresh data directly from Sanity
  perspective: 'published', // Ensure we get the latest published data
});
