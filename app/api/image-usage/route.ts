import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, getProjectsUsingImage } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    await initializeDatabase();
    const projects = await getProjectsUsingImage(url);

    return NextResponse.json({
      projects,
    });
  } catch (error) {
    console.error("Error checking image usage:", error);
    return NextResponse.json(
      { error: "Failed to check image usage" },
      { status: 500 }
    );
  }
}

