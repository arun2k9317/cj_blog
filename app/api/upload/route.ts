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
    const folder = formData.get('folder') as string | null; // Optional folder for gallery uploads

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

    // Validate folder name if provided (for gallery uploads)
    if (folder && projectId === 'gallery') {
      // Sanitize folder name: only alphanumeric, spaces, hyphens, underscores
      const sanitizedFolder = folder.trim().replace(/[^a-zA-Z0-9\s\-_]/g, '');
      if (sanitizedFolder.length === 0 || sanitizedFolder.length > 50) {
        return NextResponse.json({ error: 'Folder name must be 1-50 characters and contain only letters, numbers, spaces, hyphens, and underscores' }, { status: 400 });
      }
    }

    // Create a structured filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    let fileName: string;
    
    if (projectId === 'gallery' && folder) {
      // For gallery with folder: gallery/{folder}/{imageName}-{timestamp}.{ext}
      const sanitizedFolder = folder.trim().replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '-');
      fileName = imageName 
        ? `gallery/${sanitizedFolder}/${imageName}-${timestamp}.${fileExtension}`
        : `gallery/${sanitizedFolder}/${timestamp}-${file.name}`;
    } else {
      // Default behavior: projectId/{imageName}-{timestamp}.{ext}
      fileName = imageName 
        ? `${projectId}/${imageName}-${timestamp}.${fileExtension}`
        : `${projectId}/${timestamp}-${file.name}`;
    }

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
