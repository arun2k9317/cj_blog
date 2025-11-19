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
  folder?: string; // Folder name extracted from path
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

// Extract folder name from path (e.g., "gallery/my-folder/image.jpg" -> "my-folder")
const extractFolderFromPath = (path: string | undefined, url: string): string | undefined => {
  if (path) {
    // Check if path matches gallery/{folder}/filename pattern
    const galleryMatch = path.match(/^gallery\/([^\/]+)\/.+$/);
    if (galleryMatch) {
      return galleryMatch[1];
    }
  }
  // Fallback to URL parsing
  const urlMatch = url.match(/\/gallery\/([^\/]+)\//);
  if (urlMatch) {
    return urlMatch[1];
  }
  return undefined;
};

const toGalleryImage = (asset: AssetRecord): GalleryImage | null => {
  if (typeof asset.url !== "string") {
    return null;
  }
  const path = typeof asset.path === "string" ? asset.path : undefined;
  const folder = extractFolderFromPath(path, asset.url);
  return {
    id: typeof asset.id === "string" ? asset.id : asset.url,
    url: asset.url,
    path,
    filename: typeof asset.filename === "string" ? asset.filename : undefined,
    folder,
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderFilter = searchParams.get("folder"); // Optional folder filter

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
            const folder = extractFolderFromPath(blob.pathname, blob.url);
            galleryImages.push({
              id: blob.pathname,
              url: blob.url,
              path: blob.pathname,
              filename: blob.pathname,
              folder,
            });
          }
        });
      }
    } catch (error) {
      console.log("Could not list blobs from Vercel:", error);
    }

    // Apply folder filter if provided
    let filteredImages = galleryImages;
    if (folderFilter) {
      if (folderFilter === "all" || folderFilter === "") {
        // Show all images
        filteredImages = galleryImages;
      } else {
        // Filter by specific folder
        filteredImages = galleryImages.filter(
          (img) => img.folder === folderFilter
        );
      }
    }

    // Extract unique folders for frontend use
    const folders = Array.from(
      new Set(
        galleryImages
          .map((img) => img.folder)
          .filter((f): f is string => f !== undefined)
          .sort()
      )
    );

    return NextResponse.json({
      images: filteredImages,
      folders, // Return available folders
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images", images: [], folders: [] },
      { status: 500 }
    );
  }
}
