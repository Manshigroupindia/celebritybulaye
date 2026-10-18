/**
 * Cloudinary Media Service for Celebrity Bulaye.
 *
 * Direct browser unsigned upload integration:
 * - Cloud Name: isqhmm6j
 * - API Key: 476524377883534
 * - Unsigned Preset for General CMS (Celebrities, Galleries, Categories, Settings): cb-celebrities
 * - Unsigned Preset for Hero Banners: cb-banners
 *
 * Security: NO API Secret is stored or exposed in client code.
 */

export const CLOUDINARY_CONFIG = {
  cloudName: "isqhmm6j",
  apiKey: "476524377883534",
  presets: {
    general: "cb-celebrities", // Profiles, galleries, categories, subcategories, settings
    banners: "cb-banners",     // Hero banners ONLY
  },
} as const;

export type CloudinaryPresetType = "general" | "banners";

export interface UploadMediaOptions {
  presetType?: CloudinaryPresetType;
  prefix?: string;
  maxSizeMB?: number;
  onProgress?: (percent: number) => void;
}

export interface UploadMediaResult {
  success: boolean;
  url?: string;
  publicId?: string;
  filename?: string;
  error?: string;
}

/**
 * Upload an image file directly to Cloudinary using the appropriate unsigned preset.
 */
export async function uploadMediaFile(
  file: File,
  options?: UploadMediaOptions
): Promise<UploadMediaResult> {
  const presetType: CloudinaryPresetType = options?.presetType === "banners" ? "banners" : "general";
  const preset = options?.presetType === "banners"
    ? CLOUDINARY_CONFIG.presets.banners
    : CLOUDINARY_CONFIG.presets.general;

  // 1. Client-side file size validation (Default 10MB)
  const maxLimitMB = options?.maxSizeMB || 10;
  const maxBytes = maxLimitMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      success: false,
      error: `File size exceeds the ${maxLimitMB}MB limit. Please select an optimized image.`,
    };
  }

  // 2. Client-side format validation
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
    return {
      success: false,
      error: "Invalid file format. Please upload JPG, PNG, WebP, GIF, or SVG.",
    };
  }

  // 3. Direct upload to Cloudinary unsigned upload endpoint
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("api_key", CLOUDINARY_CONFIG.apiKey);

    if (xhr.upload && options?.onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url) {
          resolve({
            success: true,
            url: response.secure_url,
            publicId: response.public_id,
            filename: response.original_filename || file.name,
          });
        } else {
          resolve({
            success: false,
            error: response.error?.message || `Cloudinary upload failed with status ${xhr.status}`,
          });
        }
      } catch {
        resolve({
          success: false,
          error: "Failed to parse Cloudinary response.",
        });
      }
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        error: "Network error during Cloudinary upload. Please check your internet connection.",
      });
    };

    xhr.open("POST", endpoint, true);
    xhr.send(formData);
  });
}
