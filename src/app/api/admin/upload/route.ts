import { NextRequest, NextResponse } from "next/server";

const CLOUDINARY_CLOUD_NAME = "isqhmm6j";
const CLOUDINARY_API_KEY = "476524377883534";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const presetType = formData.get("presetType") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds the 10MB size limit." },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];
    if (!validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Supported formats: JPG, PNG, WEBP, GIF, SVG.",
        },
        { status: 400 }
      );
    }

    const uploadPreset = presetType === "banners" ? "cb-banners" : "cb-celebrities";

    // Upload directly to Cloudinary using unsigned upload preset
    const cldFormData = new FormData();
    cldFormData.append("file", file);
    cldFormData.append("upload_preset", uploadPreset);
    cldFormData.append("api_key", CLOUDINARY_API_KEY);

    const cldResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: cldFormData,
      }
    );

    const cldData = await cldResponse.json();

    if (!cldResponse.ok || !cldData.secure_url) {
      console.error("Cloudinary upload error:", cldData);
      return NextResponse.json(
        {
          success: false,
          error: cldData.error?.message || "Failed to upload image to Cloudinary.",
        },
        { status: cldResponse.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: cldData.secure_url,
      publicId: cldData.public_id,
      filename: cldData.original_filename || file.name,
    });
  } catch (error: unknown) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}
