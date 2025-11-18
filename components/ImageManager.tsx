"use client";

import { useCallback, useState } from "react";
import type { UploadButtonConfig } from "./ImageUpload";
import Image from "next/image";
import { useImageUpload } from "../hooks/useImageUpload";
import ImageUpload from "./ImageUpload";

interface ImageManagerProps {
  projectId: string;
  existingImages?: string[];
  onImagesChange?: (images: string[]) => void;
  maxImages?: number;
  showImagesGrid?: boolean;
  className?: string;
  onUploadButtonChange?: (config: UploadButtonConfig | null) => void;
  availableFolders?: string[]; // Available folders for gallery uploads
  onFoldersChange?: (folders: string[]) => void; // Callback when folders list changes
}

export default function ImageManager({
  projectId,
  existingImages = [],
  onImagesChange,
  maxImages = 20,
  showImagesGrid = true,
  className = "",
  onUploadButtonChange,
  availableFolders = [],
  onFoldersChange,
}: ImageManagerProps) {
  const [images, setImages] = useState<string[]>([...existingImages].reverse());
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const { uploadState, deleteImage, clearError } = useImageUpload({
    projectId,
    onSuccess: (uploadedImage) => {
      setImages((prev) => {
        const updated = [uploadedImage.url, ...prev];
        onImagesChange?.(updated);
        return updated;
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  type ImageUsageProject = {
    id: string;
    title?: string | null;
    slug?: string | null;
  };

  const describeProjects = useCallback(
    (projects: ImageUsageProject[]) =>
      projects
        .map((project) => project.title || project.slug || project.id)
        .filter(Boolean)
        .join(", "),
    []
  );

  const fetchImageUsage = useCallback(async (url: string) => {
    try {
      const response = await fetch(
        `/api/image-usage?url=${encodeURIComponent(url)}`
      );
      if (!response.ok) {
        console.error(
          `Failed to check image usage. Status: ${response.status}`
        );
        return null;
      }
      const data = (await response.json()) as {
        projects?: ImageUsageProject[];
      };
      return data.projects ?? [];
    } catch (error) {
      console.error("Failed to check image usage:", error);
      return null;
    }
  }, []);

  const handleImageUpload = useCallback(
    async (url: string, filename: string) => {
      // Image is already added via onSuccess callback
      console.log("Image uploaded successfully:", filename);

      // If this is a gallery upload, dispatch event to refresh thumbnails
      if (projectId === "gallery") {
        window.dispatchEvent(new CustomEvent("galleryImageUploaded"));
      }
    },
    [projectId]
  );

  const handleImageUploadError = useCallback((error: string) => {
    console.error("Upload error:", error);
  }, []);

  const handleDeleteImage = useCallback(
    async (url: string) => {
      const usage = await fetchImageUsage(url);
      if (usage === null) {
        alert(
          "Unable to verify whether this image is used in a project. Please try again later."
        );
        return;
      }

      if (usage.length > 0) {
        const projectList = describeProjects(usage);
        alert(
          `This image is already part of ${
            usage.length === 1 ? "a project" : "projects"
          }: ${projectList}. Remove it from the project first, then try deleting again.`
        );
        return;
      }

      if (confirm("Are you sure you want to delete this image?")) {
        const success = await deleteImage(url);
        if (success) {
          setImages((prev) => {
            const updated = prev.filter((img) => img !== url);
            onImagesChange?.(updated);
            return updated;
          });
          setSelectedImages((prev) => {
            const newSelected = new Set(prev);
            newSelected.delete(url);
            return newSelected;
          });
        }
      }
    },
    [deleteImage, describeProjects, fetchImageUsage, onImagesChange]
  );

  const handleSelectImage = (url: string) => {
    setSelectedImages((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(url)) {
        newSelected.delete(url);
      } else {
        newSelected.add(url);
      }
      return newSelected;
    });
  };

  const handleDeleteSelected = useCallback(async () => {
    if (selectedImages.size === 0) return;

    const urls = Array.from(selectedImages);
    const usageResults = await Promise.all(
      urls.map(async (url) => ({
        url,
        projects: await fetchImageUsage(url),
      }))
    );

    if (usageResults.some((result) => result.projects === null)) {
      alert(
        "Unable to verify whether some images are used in projects. Please try again later."
      );
      return;
    }

    const blocked = usageResults.filter(
      (result) => (result.projects?.length ?? 0) > 0
    );

    if (blocked.length > 0) {
      const message = blocked
        .map((result) => {
          const projectList = describeProjects(result.projects ?? []);
          return projectList
            ? `• Used in: ${projectList}`
            : "• Used in a project.";
        })
        .join("\n");
      alert(
        `The following images are already part of existing projects and cannot be deleted yet:\n${message}\nRemove them from those projects before trying again.`
      );
    }

    const deletable = usageResults
      .filter((result) => (result.projects?.length ?? 0) === 0)
      .map((result) => result.url);

    if (deletable.length === 0) {
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${deletable.length} selected ${
          deletable.length === 1 ? "image" : "images"
        }?`
      )
    ) {
      return;
    }

    const deletionResults = await Promise.all(
      deletable.map((url) => deleteImage(url))
    );

    const succeeded = deletable.filter((_, index) => deletionResults[index]);
    const failed = deletable.filter((_, index) => !deletionResults[index]);

    if (succeeded.length > 0) {
      setImages((prev) => {
        const updated = prev.filter((img) => !succeeded.includes(img));
        onImagesChange?.(updated);
        return updated;
      });
      setSelectedImages((prev) => {
        const next = new Set(prev);
        succeeded.forEach((url) => next.delete(url));
        return next;
      });
    }

    if (failed.length > 0) {
      alert(
        `Failed to delete ${failed.length} ${
          failed.length === 1 ? "image" : "images"
        }. Please try again.`
      );
    }
  }, [
    deleteImage,
    describeProjects,
    fetchImageUsage,
    onImagesChange,
    selectedImages,
  ]);

  const canUploadMore = images.length < maxImages;

  return (
    <div className={`image-manager ${className}`}>
      {/* Upload Section */}
      {canUploadMore && (
        <div className="upload-section">
          <ImageUpload
            projectId={projectId}
            onUploadComplete={handleImageUpload}
            onUploadError={handleImageUploadError}
            className="upload-component"
            onUploadButtonChange={onUploadButtonChange}
            availableFolders={availableFolders}
            onFoldersChange={onFoldersChange}
          />

          {uploadState.error && (
            <div className="error-message">
              <p>{uploadState.error}</p>
              <button onClick={clearError} className="clear-error-btn">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Images Grid */}
      {showImagesGrid && images.length > 0 && (
        <div className="images-section">
          <div className="section-header">
            <h3 className="section-title">
              Images ({images.length}/{maxImages})
            </h3>
            {selectedImages.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="delete-selected-btn"
              >
                Delete Selected ({selectedImages.size})
              </button>
            )}
          </div>

          <div className="images-grid">
            {images.map((url, index) => (
              <div
                key={url}
                className={`image-item ${
                  selectedImages.has(url) ? "selected" : ""
                }`}
                onClick={() => handleSelectImage(url)}
              >
                <div className="image-container">
                  <Image
                    src={url}
                    alt={`Image ${index + 1}`}
                    width={200}
                    height={150}
                    className="image"
                    style={{ objectFit: "cover" }}
                  />

                  {/* Selection overlay */}
                  <div className="selection-overlay">
                    <div className="selection-checkbox">
                      {selectedImages.has(url) && "✓"}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteImage(url);
                    }}
                    title="Delete image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No images state */}
      {showImagesGrid && images.length === 0 && (
        <div className="no-images">
          <p>No images uploaded yet. Upload your first image above.</p>
        </div>
      )}

      <style jsx>{`
        .image-manager {
          width: 100%;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #333;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .upload-section {
          width: 100%;
        }

        .error-message {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-message p {
          margin: 0;
          color: #c33;
        }

        .clear-error-btn {
          background: none;
          border: none;
          color: #c33;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .image-item {
          position: relative;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .image-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .image-item.selected {
          outline: 3px solid #0070f3;
          outline-offset: 2px;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 150px;
        }

        .image {
          width: 100%;
          height: 100%;
        }

        .selection-overlay {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 2;
        }

        .selection-checkbox {
          width: 24px;
          height: 24px;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
        }

        .delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background-color: rgba(204, 51, 51, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .image-item:hover .delete-btn {
          opacity: 1;
        }

        .delete-selected-btn {
          background-color: #c33;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .delete-selected-btn:hover {
          background-color: #a22;
        }

        .no-images {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}
