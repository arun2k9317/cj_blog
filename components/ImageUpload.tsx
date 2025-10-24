'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  projectId: string;
  onUploadComplete: (url: string, filename: string) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

interface UploadProgress {
  uploading: boolean;
  progress: number;
  fileName?: string;
}

export default function ImageUpload({ 
  projectId, 
  onUploadComplete, 
  onUploadError,
  maxFileSize = 50,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadProgress>({ uploading: false, progress: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please use: ${acceptedTypes.join(', ')}`;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onUploadError?.(validationError);
      return;
    }

    setUploadState({ uploading: true, progress: 0, fileName: file.name });

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    
    // Optional: add a custom name for the image
    const imageName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    formData.append('imageName', imageName);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadState({ uploading: true, progress: 100 });
        onUploadComplete(result.url, result.filename);
        
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);
        setPreview(null);
        
        // Reset state after a brief delay
        setTimeout(() => {
          setUploadState({ uploading: false, progress: 0 });
        }, 1000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      onUploadError?.(errorMessage);
      setUploadState({ uploading: false, progress: 0 });
      
      // Clean up preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploadState.uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadState.uploading}
        />

        {uploadState.uploading ? (
          <div className="upload-progress">
            <div className="upload-spinner"></div>
            <p className="upload-text">Uploading {uploadState.fileName}...</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
          </div>
        ) : preview ? (
          <div className="upload-preview">
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={150}
              className="preview-image"
              style={{ objectFit: 'cover' }}
            />
            <p className="preview-text">Click to upload or drag another image</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <p className="upload-text">Drag & drop an image here or click to select</p>
            <p className="upload-subtext">Supports: JPG, PNG, WebP (Max {maxFileSize}MB)</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .image-upload-container {
          width: 100%;
        }

        .upload-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #fafafa;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .upload-area:hover {
          border-color: #0070f3;
          background-color: #f0f8ff;
        }

        .upload-area.drag-over {
          border-color: #0070f3;
          background-color: #e6f3ff;
          transform: scale(1.02);
        }

        .upload-area.uploading {
          border-color: #0070f3;
          background-color: #f0f8ff;
          cursor: not-allowed;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-icon {
          color: #666;
        }

        .upload-text {
          font-size: 1.1rem;
          color: #333;
          margin: 0;
        }

        .upload-subtext {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #0070f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .progress-bar {
          width: 200px;
          height: 4px;
          background-color: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #0070f3;
          transition: width 0.3s ease;
        }

        .upload-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .preview-image {
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .preview-text {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
