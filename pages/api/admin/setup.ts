import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message?: string;
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

  try {
    // Check auth via session token (Pages Router approach)
    const sessionToken = req.cookies['__session'] || req.cookies['__clerk_db_jwt'];
    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated - please sign in" });
    }

    // We'll need to get userId differently - for now, skip this endpoint
    // This endpoint is only used once during setup anyway
    return res.status(501).json({ 
      error: "Please use Clerk Dashboard to grant admin access",
      details: "Go to Clerk Dashboard > Users > Select user > Metadata > Add isAdmin: true"
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Admin setup error:", errorMessage);
    return res.status(500).json({
      error: "Failed to setup admin access",
      details: errorMessage,
    });
  }
}
