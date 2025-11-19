import { getProjects, getAssets } from "@/lib/supabase";
import AdminDashboardUI from "@/components/AdminDashboardUI";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  featured_image?: string | null;
  published?: boolean | null;
  [key: string]: unknown;
};

type AssetRecord = {
  id?: string;
  url?: string | null;
  path?: string | null;
  filename?: string | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  [key: string]: unknown;
};

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

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Server-side fetch for speed and to keep keys server-only
  // Projects (kind=project) and Stories (kind=story) are optional if 'kind' column exists.
  // If 'kind' doesn't exist in your DB, remove the kind filter below.
  let projects: ProjectRow[] = [];
  let stories: ProjectRow[] = [];
  let assets: AssetRecord[] = [];

  try {
    projects = await getProjects({ publishedOnly: false, kind: "project" });
  } catch {
    // Fallback: fetch all and treat as projects
    projects = await getProjects({ publishedOnly: false }).catch(() => []);
  }

  try {
    stories = await getProjects({ publishedOnly: false, kind: "story" });
  } catch {
    // If 'kind' not present yet, leave stories empty
    stories = [];
  }

  try {
    assets = await getAssets();
  } catch {
    assets = [];
  }

  const galleryAssets = assets
    .filter(isGalleryAsset)
    .map((asset) => (typeof asset.url === "string" ? { url: asset.url } : null))
    .filter((asset): asset is { url: string } => asset !== null);

  return (
    <AdminDashboardUI
      projects={projects}
      stories={stories}
      galleryAssets={galleryAssets}
    />
  );
}
