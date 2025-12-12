import { NextRequest, NextResponse } from "next/server";
import { getIconicImages, saveIconicImages } from "@/lib/supabase";

export async function GET() {
    try {
        const images = await getIconicImages();
        return NextResponse.json({ images });
    } catch (error) {
        console.error("Error fetching iconic images:", error);
        return NextResponse.json(
            { error: "Failed to fetch iconic images" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { urls } = await req.json();
        if (!Array.isArray(urls)) {
            return NextResponse.json(
                { error: "Invalid data format. 'urls' must be an array." },
                { status: 400 }
            );
        }

        const saved = await saveIconicImages(urls);
        return NextResponse.json({ success: true, saved });
    } catch (error) {
        console.error("Error saving iconic images:", error);
        return NextResponse.json(
            { error: "Failed to save iconic images" },
            { status: 500 }
        );
    }
}
