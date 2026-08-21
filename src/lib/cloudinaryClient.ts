/**
 * Client-side helper to delete images or videos from Cloudinary via /api/upload DELETE route.
 */
export async function deleteCloudinaryAsset(
  urlOrUrls: string | string[] | null | undefined
): Promise<boolean> {
  try {
    if (!urlOrUrls) return true;

    const rawList = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
    const validUrls = rawList
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map((u) => u.trim());

    // Only send valid Cloudinary assets (URLs or direct IDs)
    const cloudinaryAssets = validUrls.filter(
      (u) =>
        u.includes("cloudinary.com") ||
        (!u.startsWith("http://") && !u.startsWith("https://") && u.includes("/"))
    );

    if (cloudinaryAssets.length === 0) return true;

    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: cloudinaryAssets }),
    });

    if (!res.ok) {
      console.warn("Cloudinary delete request responded with status:", res.status);
      return false;
    }

    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.error("Failed to delete Cloudinary asset:", err);
    return false;
  }
}
