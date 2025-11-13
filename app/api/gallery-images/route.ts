import { getAssets } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

interface AssetRecord {
  id?: string;
  url?: string | null;
  path?: string | null;
  filename?: string | null;
  [key: string]: unknown;
}

interface GalleryImage {
  id?: string;
  url: string;
  path?: string;
  filename?: string;
}

const isGalleryAsset = (asset: AssetRecord): boolean => {
  const pathStr = typeof asset.path === "string" ? asset.path : "";
  const urlStr = typeof asset.url === "string" ? asset.url : "";
  const filenameStr = typeof asset.filename === "string" ? asset.filename : "";
  return (
    pathStr.includes("gallery") ||
    urlStr.includes("/gallery/") ||
    urlStr.includes("/gallery") ||
    filenameStr.includes("gallery")
  );
};

const toGalleryImage = (asset: AssetRecord): GalleryImage | null => {
  if (typeof asset.url !== "string") {
    return null;
  }
  return {
    id: typeof asset.id === "string" ? asset.id : asset.url,
    url: asset.url,
    path: typeof asset.path === "string" ? asset.path : undefined,
    filename: typeof asset.filename === "string" ? asset.filename : undefined,
  };
};

export async function GET() {
  try {
    // Try to get assets from Supabase first
    let assets: AssetRecord[] = [];
    try {
      assets = await getAssets();
    } catch (error) {
      console.log("Could not fetch from Supabase assets table:", error);
    }

    const galleryImages: GalleryImage[] = assets
      .filter(isGalleryAsset)
      .map(toGalleryImage)
      .filter(
        (image): image is GalleryImage => image !== null
      );

    // Also try to list blobs directly from Vercel Blob if token is available
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        const { blobs } = await list({ prefix: "gallery/", token });
        const blobUrls = new Set(galleryImages.map((img) => img.url));
        blobs.forEach((blob) => {
          if (!blobUrls.has(blob.url)) {
            galleryImages.push({
              id: blob.pathname,
              url: blob.url,
              path: blob.pathname,
              filename: blob.pathname,
            });
          }
        });
      }
    } catch (error) {
      console.log("Could not list blobs from Vercel:", error);
    }

    return NextResponse.json({ images: galleryImages });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images", images: [] },
      { status: 500 }
    );
  }
}
