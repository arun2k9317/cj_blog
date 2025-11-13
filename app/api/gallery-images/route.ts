import { getAssets } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Try to get assets from Supabase first
    let assets: any[] = [];
    try {
      assets = await getAssets();
    } catch (error) {
      console.log('Could not fetch from Supabase assets table:', error);
    }

    // Filter for gallery images
    const galleryImages = (assets || []).filter((a: any) => {
      const path = a?.path || '';
      const url = a?.url || '';
      const filename = a?.filename || '';
      const pathStr = typeof path === 'string' ? path : '';
      const urlStr = typeof url === 'string' ? url : '';
      const filenameStr = typeof filename === 'string' ? filename : '';
      return (
        pathStr.includes('gallery') ||
        urlStr.includes('/gallery/') ||
        urlStr.includes('/gallery') ||
        filenameStr.includes('gallery')
      );
    });

    // Also try to list blobs directly from Vercel Blob if token is available
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        const { blobs } = await list({ prefix: 'gallery/', token });
        // Merge blob URLs with existing assets, avoiding duplicates
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
      console.log('Could not list blobs from Vercel:', error);
    }

    return NextResponse.json({ images: galleryImages });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images', images: [] },
      { status: 500 }
    );
  }
}

