# Vercel Blob Storage Setup Guide

This guide will help you set up Vercel Blob Storage for your photography blog.

## Prerequisites

1. A Vercel account
2. Your Next.js project deployed on Vercel (or ready to deploy)

## Step 1: Create a Blob Store

1. Go to your Vercel dashboard
2. Navigate to your project
3. Click on the **Storage** tab
4. Click **Create New** → Select **Blob** → Click **Continue**
5. Name your blob store (e.g., "cj-photography-images")
6. Choose the environments where you want read-write access
7. Click **Create a new Blob store**

## Step 2: Get Your Access Token

1. After creating the blob store, go to the **Settings** tab
2. Copy the **Read-Write Token**
3. This token will be automatically added to your Vercel deployment environment variables

## Step 3: Local Development Setup

For local development, you need to pull the environment variables:

```bash
vercel env pull
```

This creates a `.env.local` file with your `BLOB_READ_WRITE_TOKEN`.

## Step 4: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the admin page: `http://localhost:3000/admin`
3. Try uploading an image to test the setup

## Step 5: Bulk Upload Existing Images

If you have existing images to upload, use the bulk upload script:

```bash
# Install ts-node if you haven't already
npm install -g ts-node

# Run the upload script
npx ts-node scripts/upload-images.ts "your-project-id" "./path/to/images" --dry-run
```

Replace:
- `"your-project-id"` with your actual project ID (e.g., "carla-ridge-residence")
- `"./path/to/images"` with the path to your images directory

## Available Components

### ImageUpload
A drag-and-drop image upload component with progress tracking.

### ImageManager
A comprehensive image management component that includes:
- Upload functionality
- Image grid display
- Bulk selection and deletion
- Image preview

### useImageUpload Hook
A custom hook for managing image uploads with state management.

## API Routes

### POST /api/upload
Uploads a single image to Vercel Blob Storage.

**Parameters:**
- `file`: The image file to upload
- `projectId`: The project identifier
- `imageName`: Optional custom name for the image

### DELETE /api/delete-image
Deletes an image from Vercel Blob Storage.

**Parameters:**
- `url`: The URL of the image to delete

## Usage Examples

### Basic Image Upload
```tsx
import ImageUpload from '@/components/ImageUpload';

function MyComponent() {
  const handleUpload = (url: string, filename: string) => {
    console.log('Image uploaded:', url);
  };

  return (
    <ImageUpload
      projectId="my-project"
      onUploadComplete={handleUpload}
    />
  );
}
```

### Image Manager
```tsx
import ImageManager from '@/components/ImageManager';

function ProjectPage() {
  const handleImagesChange = (images: string[]) => {
    console.log('Images updated:', images);
  };

  return (
    <ImageManager
      projectId="my-project"
      onImagesChange={handleImagesChange}
      maxImages={10}
    />
  );
}
```

## Configuration

The Next.js configuration has been updated to support Vercel Blob domains. Images from your blob store will be automatically optimized by Next.js Image component.

## Troubleshooting

### Common Issues

1. **Upload fails with 401 error**
   - Check that your `BLOB_READ_WRITE_TOKEN` is correct
   - Ensure the token has the right permissions

2. **Images not displaying**
   - Verify the domain is added to `next.config.ts`
   - Check that the image URLs are correct

3. **File size errors**
   - Default limit is 50MB per file
   - Check your file sizes before uploading

### Getting Help

If you encounter issues:
1. Check the Vercel dashboard for blob store status
2. Review the browser console for error messages
3. Check the Next.js logs for API route errors

## Pricing

- **Storage**: $0.15/GB/month
- **Bandwidth**: $0.40/GB for egress
- **API Calls**: $0.50 per 1M requests

Monitor your usage in the Vercel dashboard to avoid unexpected costs.
