import { NextRequest, NextResponse } from "next/server";
import cloudinary, { deleteFromCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "shaz-al-oud/hero",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, urls, public_id } = body;

    const targets: string[] = [];
    if (url && typeof url === "string") targets.push(url);
    if (public_id && typeof public_id === "string") targets.push(public_id);
    if (Array.isArray(urls)) {
      urls.forEach((u) => {
        if (u && typeof u === "string") targets.push(u);
      });
    }

    if (targets.length === 0) {
      return NextResponse.json(
        { error: "No asset URL or public_id provided for deletion" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      targets.map((target) => deleteFromCloudinary(target))
    );

    const allSuccessful = results.every((r) => r.success);

    return NextResponse.json({
      success: allSuccessful,
      results,
    });
  } catch (error: any) {
    console.error("Cloudinary deletion error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete Cloudinary asset" },
      { status: 500 }
    );
  }
}
