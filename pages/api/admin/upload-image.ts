import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File as FormidableFile } from "formidable";
import { readFileSync } from "fs";
import { getAuth } from "@clerk/nextjs/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  assetId?: string;
  url?: string;
  error?: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check auth via session token (Pages Router approach)
  const sessionToken = req.cookies['__session'] || req.cookies['__clerk_db_jwt'];
  if (!sessionToken) {
    return res.status(401).json({ error: "Not authenticated - please sign in" });
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN || "";

  if (!projectId || !token) {
    return res.status(500).json({
      error: "Sanity configuration is missing",
    });
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.mimetype || "")) {
      return res.status(400).json({
        error: "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.",
      });
    }

    // Read file as buffer
    const fileBuffer = readFileSync(file.filepath);

    const uploadUrl = `https://${projectId}.api.sanity.io/v2024-01-01/assets/images/${dataset}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.mimetype || "application/octet-stream",
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(
        errorData.message || `Upload failed with status ${uploadResponse.status}`
      );
    }

    const result = await uploadResponse.json();

    return res.status(200).json({
      assetId: result.document._id,
      url: result.document.url,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({
      error: "Failed to upload image",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
