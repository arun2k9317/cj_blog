import { NextResponse } from "next/server";
import { initializeDatabase, createProject } from "@/lib/supabase";
import { BLOB_BASE } from "@/lib/series";

type SeedProject = Parameters<typeof createProject>[0];

const isDuplicateError = (error: unknown): boolean => {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
      .toLowerCase()
      .includes("duplicate");
  }
  return false;
};

export async function POST() {
  try {
    // Ensure base schema exists (no-ops if already created)
    await initializeDatabase();

    const demo: SeedProject[] = [
      {
        id: "demo-project-one",
        title: "Demo Project One",
        slug: "demo-project-one",
        description: "Sample project to verify admin list rendering",
        location: "Sample Location",
        featuredImage: `${BLOB_BASE}/behindTheTeaCup/behindTheTeaCup_1.jpg`,
        published: true,
        tags: ["demo", "project"],
        kind: "project",
      },
      {
        id: "demo-story-one",
        title: "Demo Story One",
        slug: "demo-story-one",
        description: "Sample story to verify admin list rendering",
        location: "Sample Location",
        featuredImage: `${BLOB_BASE}/duskFallsOnMountains/duskFallsOnMountains_1.jpg`,
        published: true,
        tags: ["demo", "story"],
        kind: "story",
      },
    ];

    for (const project of demo) {
      try {
        await createProject(project);
      } catch (error) {
        if (isDuplicateError(error)) {
          continue;
        }
        if (project.kind) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { kind: _kind, ...withoutKind } = project;
          const fallbackProject: SeedProject = { ...withoutKind };
          await createProject(fallbackProject);
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
        path: url.replace(`${BLOB_BASE}/`, ""),
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
