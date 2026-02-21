import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { password } = request.body;

  if (!password) {
    return response.status(400).json({ error: "Password is required" });
  }

  // Check if the password matches the admin password in environment variables
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return response
      .status(500)
      .json({ error: "Admin password not configured" });
  }

  // Simple string comparison (for production, consider using bcrypt or similar)
  if (password === adminPassword) {
    return response.status(200).json({ success: true });
  }

  return response.status(401).json({ error: "Invalid password" });
}
