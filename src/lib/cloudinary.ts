import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Extracts public_id and resource_type from a Cloudinary URL or direct public ID.
 */
export function extractPublicId(
  urlOrId: string
): { publicId: string; resourceType: "image" | "video" | "raw" } | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // Direct public_id provided
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const isVideo = /\.(mp4|mov|webm|avi|mkv)$/i.test(trimmed);
    const cleanId = trimmed.replace(/\.[^/.]+$/, "");
    return { publicId: cleanId, resourceType: isVideo ? "video" : "image" };
  }

  // Must be a Cloudinary URL
  if (!trimmed.includes("cloudinary.com")) return null;

  try {
    const isVideo =
      trimmed.includes("/video/upload/") ||
      /\.(mp4|mov|webm|avi|mkv)(\?.*)?$/i.test(trimmed);
    const resourceType = isVideo ? "video" : "image";

    // Split on /upload/ with optional version prefix like /v1234567890/
    const uploadMatch = trimmed.match(
      /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?(?:\?.*)?$/
    );
    if (uploadMatch && uploadMatch[1]) {
      const publicId = decodeURIComponent(uploadMatch[1]);
      return { publicId, resourceType };
    }

    // Fallback split
    const parts = trimmed.split("/upload/");
    if (parts.length > 1) {
      let rest = parts[1].split("?")[0];
      rest = rest.replace(/^v\d+\//, "");
      rest = rest.replace(/\.[^/.]+$/, "");
      return { publicId: decodeURIComponent(rest), resourceType };
    }

    return null;
  } catch (e) {
    console.error("Error extracting Cloudinary public ID:", e);
    return null;
  }
}

/**
 * Deletes an asset from Cloudinary using its URL or public ID.
 */
export async function deleteFromCloudinary(
  urlOrId: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const extracted = extractPublicId(urlOrId);
    if (!extracted) {
      return { success: false, error: "Not a valid Cloudinary asset" };
    }

    const result = await cloudinary.uploader.destroy(extracted.publicId, {
      resource_type: extracted.resourceType,
      invalidate: true,
    });

    return {
      success: result.result === "ok" || result.result === "not found",
      result,
    };
  } catch (err: any) {
    console.error("Error deleting from Cloudinary:", err);
    return { success: false, error: err.message || "Deletion failed" };
  }
}

export default cloudinary;
