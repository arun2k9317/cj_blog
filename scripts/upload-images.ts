import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';

interface UploadOptions {
  projectId: string;
  imagesDir: string;
  dryRun?: boolean;
  batchSize?: number;
  delay?: number;
}

interface UploadResult {
  success: boolean;
  filename: string;
  url?: string;
  error?: string;
}

class ImageUploader {
  private projectId: string;
  private imagesDir: string;
  private dryRun: boolean;
  private batchSize: number;
  private delay: number;
  private results: UploadResult[] = [];

  constructor(options: UploadOptions) {
    this.projectId = options.projectId;
    this.imagesDir = options.imagesDir;
    this.dryRun = options.dryRun || false;
    this.batchSize = options.batchSize || 5;
    this.delay = options.delay || 1000; // 1 second delay between batches
  }

  private getImageFiles(): string[] {
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const files = fs.readdirSync(this.imagesDir);
    
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return supportedExtensions.includes(ext);
    });
  }

  private async uploadSingleImage(filename: string): Promise<UploadResult> {
    try {
      const filePath = path.join(this.imagesDir, filename);
      const fileStats = fs.statSync(filePath);
      
      // Validate file size (max 50MB)
      if (fileStats.size > 50 * 1024 * 1024) {
        return {
          success: false,
          filename,
          error: `File size too large: ${(fileStats.size / 1024 / 1024).toFixed(2)}MB`
        };
      }

      if (this.dryRun) {
        console.log(`[DRY RUN] Would upload: ${filename}`);
        return {
          success: true,
          filename,
          url: `https://dry-run-url.com/${this.projectId}/${filename}`
        };
      }

      const fileStream = createReadStream(filePath);
      const blob = await put(`${this.projectId}/${filename}`, fileStream, {
        access: 'public',
        addRandomSuffix: false,
      });

      return {
        success: true,
        filename,
        url: blob.url
      };

    } catch (error) {
      return {
        success: false,
        filename,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async delayMs(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async uploadAll(): Promise<UploadResult[]> {
    const files = this.getImageFiles();
    
    if (files.length === 0) {
      console.log('No image files found in the specified directory.');
      return [];
    }

    console.log(`Found ${files.length} image files to upload.`);
    
    if (this.dryRun) {
      console.log('Running in DRY RUN mode - no actual uploads will occur.');
    }

    // Process files in batches
    for (let i = 0; i < files.length; i += this.batchSize) {
      const batch = files.slice(i, i + this.batchSize);
      console.log(`Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(files.length / this.batchSize)}`);
      
      const batchPromises = batch.map(file => this.uploadSingleImage(file));
      const batchResults = await Promise.all(batchPromises);
      
      this.results.push(...batchResults);
      
      // Log batch results
      batchResults.forEach(result => {
        if (result.success) {
          console.log(`✅ ${result.filename} - ${result.url}`);
        } else {
          console.log(`❌ ${result.filename} - ${result.error}`);
        }
      });

      // Delay between batches to avoid rate limiting
      if (i + this.batchSize < files.length) {
        console.log(`Waiting ${this.delay}ms before next batch...`);
        await this.delayMs(this.delay);
      }
    }

    return this.results;
  }

  public generateReport(): void {
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log('\n=== UPLOAD REPORT ===');
    console.log(`Total files: ${this.results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.log('\nFailed uploads:');
      failed.forEach(result => {
        console.log(`- ${result.filename}: ${result.error}`);
      });
    }

    if (successful.length > 0 && !this.dryRun) {
      console.log('\nSuccessful uploads:');
      successful.forEach(result => {
        console.log(`- ${result.filename}: ${result.url}`);
      });

      // Generate JSON file with all URLs
      const uploadData = {
        projectId: this.projectId,
        uploadDate: new Date().toISOString(),
        images: successful.map(result => ({
          filename: result.filename,
          url: result.url
        }))
      };

      const outputFile = `upload-results-${this.projectId}-${Date.now()}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(uploadData, null, 2));
      console.log(`\nUpload results saved to: ${outputFile}`);
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: ts-node upload-images.ts <projectId> <imagesDir> [options]');
    console.log('Options:');
    console.log('  --dry-run    Run without actually uploading files');
    console.log('  --batch-size <number>  Number of files to upload in parallel (default: 5)');
    console.log('  --delay <number>       Delay between batches in ms (default: 1000)');
    console.log('');
    console.log('Example:');
    console.log('  ts-node upload-images.ts "carla-ridge-residence" "./images/carla-ridge" --dry-run');
    return;
  }

  const projectId = args[0];
  const imagesDir = args[1];
  const dryRun = args.includes('--dry-run');
  const batchSizeArg = args.indexOf('--batch-size');
  const delayArg = args.indexOf('--delay');
  
  const batchSize = batchSizeArg !== -1 ? parseInt(args[batchSizeArg + 1]) || 5 : 5;
  const delay = delayArg !== -1 ? parseInt(args[delayArg + 1]) || 1000 : 1000;

  // Validate directory exists
  if (!fs.existsSync(imagesDir)) {
    console.error(`Error: Directory '${imagesDir}' does not exist.`);
    return;
  }

  const uploader = new ImageUploader({
    projectId,
    imagesDir,
    dryRun,
    batchSize,
    delay
  });

  try {
    await uploader.uploadAll();
    uploader.generateReport();
  } catch (error) {
    console.error('Upload process failed:', error);
  }
}

// Export for programmatic use
export { ImageUploader };
export type { UploadOptions, UploadResult };

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
