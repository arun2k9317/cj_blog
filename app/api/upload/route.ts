import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const imageName = formData.get('imageName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Create a structured filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = imageName 
      ? `${projectId}/${imageName}-${timestamp}.${fileExtension}`
      : `${projectId}/${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false, // We're handling naming ourselves
      token,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: fileName,
      size: file.size,
      contentType: file.type,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
