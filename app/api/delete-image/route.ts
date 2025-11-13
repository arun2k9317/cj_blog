import { del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, getProjectsUsingImage } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            'Blob token missing. Set BLOB_READ_WRITE_TOKEN in your environment (see BLOB_SETUP.md).',
        },
        { status: 500 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    await initializeDatabase();
    const projects = await getProjectsUsingImage(url);

    if (projects.length > 0) {
      return NextResponse.json(
        {
          error: 'Image is used in existing projects',
          projects,
          message:
            'This image is referenced by one or more projects. Remove it from those projects before deleting.',
        },
        { status: 409 }
      );
    }

    // Delete from Vercel Blob
    await del(url, { token });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
