# 🚀 Quick Start Guide - Vercel Blob Storage Setup

You've successfully created your blob store `cj-photography-images` and have your `BLOB_READ_WRITE_TOKEN`. Here's what to do next:

## Step 1: Configure Environment Variables

1. **Edit the `.env.local` file** that was just created
2. **Replace `your_actual_token_here`** with your actual `BLOB_READ_WRITE_TOKEN`

```env
BLOB_READ_WRITE_TOKEN=your_actual_token_here
```

## Step 2: Start Development Server

```bash
npm run dev
```

## Step 3: Test Image Upload Interface

1. Navigate to: `http://localhost:3000/admin`
2. Select a project from the dropdown
3. Try uploading an image using the drag & drop interface
4. Verify the image appears in the grid

## Step 4: Bulk Upload Existing Images (Optional)

If you have existing images to upload:

```bash
# First, copy your images to a directory
# Then run a dry-run test:
npm run upload-images:dry-run "project-name" "./path/to/your/images"

# If the dry-run looks good, run the actual upload:
npm run upload-images "project-name" "./path/to/your/images"
```

## Troubleshooting

### If the test fails:
1. **Check your token**: Make sure you copied the complete token
2. **Check blob store**: Verify `cj-photography-images` exists in your Vercel dashboard
3. **Check permissions**: Ensure the token has read-write access

### If uploads fail:
1. **Check file size**: Images should be under 50MB
2. **Check file format**: Supported formats are JPG, PNG, WebP
3. **Check console**: Look for error messages in the browser console

## Your Blob Store Details

- **Store Name**: `cj-photography-images`
- **Access**: Public
- **Token**: Configured in `.env.local`

## Next Steps

Once everything is working:
1. Start uploading your photography images
2. Organize them by project
3. Use the admin interface to manage your image library
4. Integrate the ImageManager component into your project pages

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the terminal output for server errors
3. Verify your Vercel Blob Storage settings in the dashboard
