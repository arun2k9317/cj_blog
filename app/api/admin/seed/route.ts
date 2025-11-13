import { NextResponse } from "next/server";
import { initializeDatabase, createProject } from "@/lib/supabase";
import { BLOB_BASE } from "@/lib/series";

export async function POST() {
  try {
    // Ensure base schema exists (no-ops if already created)
    await initializeDatabase();

    const demo = [
      {
        id: "demo-project-one",
        title: "Demo Project One",
        slug: "demo-project-one",
        description: "Sample project to verify admin list rendering",
        location: "Sample Location",
        featuredImage: `${BLOB_BASE}/behindTheTeaCup/behindTheTeaCup_1.jpg`,
        published: true as const,
        tags: ["demo", "project"],
        kind: "project" as const,
      },
      {
        id: "demo-story-one",
        title: "Demo Story One",
        slug: "demo-story-one",
        description: "Sample story to verify admin list rendering",
        location: "Sample Location",
        featuredImage: `${BLOB_BASE}/duskFallsOnMountains/duskFallsOnMountains_1.jpg`,
        published: true as const,
        tags: ["demo", "story"],
        kind: "story" as const,
      },
    ];

    for (const p of demo) {
      try {
        await createProject(p);
      } catch (e: any) {
        // Ignore unique violations so the route is idempotent
        if (!e?.message?.toLowerCase?.().includes("duplicate")) {
          // If some other error (e.g., 'kind' column missing), try without 'kind'
          if (p.kind) {
            const { kind, ...withoutKind } = p;
            await createProject(withoutKind as any);
          }
        }
      }
    }

    // Optionally try to insert assets if the table exists. If not, ignore.
    try {
      const urls = [
        `${BLOB_BASE}/behindTheTeaCup/behindTheTeaCup_2.jpg`,
        `${BLOB_BASE}/duskFallsOnMountains/duskFallsOnMountains_2.jpg`,
      ];
      const body = urls.map((url) => ({
        url,
        path: url.replace(BLOB_BASE + "/", ""),
        provider: "vercel_blob",
        is_public: true,
      }));

      // Lazy import to avoid coupling to lib types
      const { getSupabaseServerClient } = await import("@/lib/supabase");
      const supabase = getSupabaseServerClient();
      await supabase.from("assets").insert(body);
    } catch {
      // Silently ignore if assets table/policies don't exist
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ ok: false, error: "Seed failed" }, { status: 500 });
  }
}






