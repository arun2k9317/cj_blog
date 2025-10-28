import { put } from '@vercel/blob';
import { readFileSync } from 'fs';
import { join } from 'path';

// Sample images to upload to blob storage
const sampleImages = [
    // Nature & Wildlife Series
    { localPath: 'sample-images/nature-wildlife-series/featured-image.jpg', blobPath: 'nature-wildlife-series/featured-image.jpg' },
    { localPath: 'sample-images/nature-wildlife-series/eagle-portrait.jpg', blobPath: 'nature-wildlife-series/eagle-portrait.jpg' },
    { localPath: 'sample-images/nature-wildlife-series/deer-forest.jpg', blobPath: 'nature-wildlife-series/deer-forest.jpg' },
    { localPath: 'sample-images/nature-wildlife-series/bear-fishing.jpg', blobPath: 'nature-wildlife-series/bear-fishing.jpg' },
    { localPath: 'sample-images/nature-wildlife-series/wolf-pack.jpg', blobPath: 'nature-wildlife-series/wolf-pack.jpg' },
    { localPath: 'sample-images/nature-wildlife-series/owl-night.jpg', blobPath: 'nature-wildlife-series/owl-night.jpg' },

    // Urban Life Documentary
    { localPath: 'sample-images/urban-life-documentary/featured-image.jpg', blobPath: 'urban-life-documentary/featured-image.jpg' },
    { localPath: 'sample-images/urban-life-documentary/street-vendor.jpg', blobPath: 'urban-life-documentary/street-vendor.jpg' },
    { localPath: 'sample-images/urban-life-documentary/commuter-rush.jpg', blobPath: 'urban-life-documentary/commuter-rush.jpg' },
    { localPath: 'sample-images/urban-life-documentary/street-artist.jpg', blobPath: 'urban-life-documentary/street-artist.jpg' },
    { localPath: 'sample-images/urban-life-documentary/food-truck.jpg', blobPath: 'urban-life-documentary/food-truck.jpg' },
    { localPath: 'sample-images/urban-life-documentary/rooftop-view.jpg', blobPath: 'urban-life-documentary/rooftop-view.jpg' },

    // Cultural Heritage & Monuments
    { localPath: 'sample-images/cultural-heritage-monuments/featured-image.jpg', blobPath: 'cultural-heritage-monuments/featured-image.jpg' },
    { localPath: 'sample-images/cultural-heritage-monuments/ancient-temple.jpg', blobPath: 'cultural-heritage-monuments/ancient-temple.jpg' },
    { localPath: 'sample-images/cultural-heritage-monuments/traditional-craftsman.jpg', blobPath: 'cultural-heritage-monuments/traditional-craftsman.jpg' },
    { localPath: 'sample-images/cultural-heritage-monuments/historical-monument.jpg', blobPath: 'cultural-heritage-monuments/historical-monument.jpg' },
    { localPath: 'sample-images/cultural-heritage-monuments/festival-dance.jpg', blobPath: 'cultural-heritage-monuments/festival-dance.jpg' },
    { localPath: 'sample-images/cultural-heritage-monuments/textile-art.jpg', blobPath: 'cultural-heritage-monuments/textile-art.jpg' },
    { localPath: 'sample-images/cultural-heritage-monuments/ceremonial-mask.jpg', blobPath: 'cultural-heritage-monuments/ceremonial-mask.jpg' },
    { localPath: 'sample-images/cultural-heritage-monuments/ancient-script.jpg', blobPath: 'cultural-heritage-monuments/ancient-script.jpg' }
];

async function uploadSampleImages() {
    console.log('Starting sample image upload to Vercel Blob Storage...');

    for (const image of sampleImages) {
        try {
            const imagePath = join(process.cwd(), image.localPath);

            // Check if file exists
            try {
                const fileBuffer = readFileSync(imagePath);

                // Upload to blob storage
                const blob = await put(image.blobPath, fileBuffer, {
                    access: 'public',
                });

                console.log(`✅ Uploaded: ${image.blobPath} -> ${blob.url}`);
            } catch (fileError) {
                console.log(`⚠️  File not found: ${image.localPath} - Please add this image manually`);
                console.log(`   Expected blob path: ${image.blobPath}`);
            }
        } catch (error) {
            console.error(`❌ Failed to upload ${image.blobPath}:`, error);
        }
    }

    console.log('\n📋 Manual Upload Instructions:');
    console.log('If any images were missing, please upload them manually to Vercel Blob Storage with these exact paths:');
    sampleImages.forEach(image => {
        console.log(`   ${image.blobPath}`);
    });

    console.log('\n🎯 You can upload via:');
    console.log('1. Vercel Dashboard -> Storage -> Blob');
    console.log('2. Admin dashboard at /admin');
    console.log('3. API endpoint at /api/upload');
}

// Run if called directly
if (require.main === module) {
    uploadSampleImages().catch(console.error);
}

export { uploadSampleImages };

