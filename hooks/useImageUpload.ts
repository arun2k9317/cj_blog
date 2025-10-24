'use client';

import { useState, useCallback } from 'react';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

interface UseImageUploadOptions {
  projectId: string;
  onSuccess?: (image: UploadedImage) => void;
  onError?: (error: string) => void;
  maxFileSize?: number;
}

export function useImageUpload({
  projectId,
  onSuccess,
  onError,
  maxFileSize = 50
}: UseImageUploadOptions) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const uploadImage = useCallback(async (file: File, customName?: string) => {
    if (!file) {
      const error = 'No file provided';
      setUploadState(prev => ({ ...prev, error }));
      onError?.(error);
      return null;
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      const error = 'File must be an image';
      setUploadState(prev => ({ ...prev, error }));
      onError?.(error);
      return null;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      const error = `File size must be less than ${maxFileSize}MB`;
      setUploadState(prev => ({ ...prev, error }));
      onError?.(error);
      return null;
    }

    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      success: false
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      
      if (customName) {
        formData.append('imageName', customName);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      const uploadedImage: UploadedImage = {
        url: result.url,
        filename: result.filename,
        size: result.size,
        uploadedAt: result.uploadedAt
      };

      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        success: true
      });

      setUploadedImages(prev => [...prev, uploadedImage]);
      onSuccess?.(uploadedImage);

      // Reset success state after a delay
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, success: false }));
      }, 2000);

      return uploadedImage;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      onError?.(errorMessage);
      return null;
    }
  }, [projectId, maxFileSize, onSuccess, onError]);

  const deleteImage = useCallback(async (url: string) => {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      // Remove from local state
      setUploadedImages(prev => prev.filter(img => img.url !== url));
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      onError?.(errorMessage);
      return false;
    }
  }, [onError]);

  const resetUploadState = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
  }, []);

  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    uploadState,
    uploadedImages,
    uploadImage,
    deleteImage,
    resetUploadState,
    clearError,
  };
}
