"use client";

import { ImageGalleryBlock as ImageGalleryBlockType } from "@/types/project";
import { useState } from "react";
import Image from "next/image";

interface ImageGalleryBlockProps {
  block: ImageGalleryBlockType;
  isEditing?: boolean;
  onUpdate?: (block: ImageGalleryBlockType) => void;
  onDelete?: (blockId: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function ImageGalleryBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onImageUpload,
}: ImageGalleryBlockProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !onImageUpload) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) => onImageUpload(file));
      const imageUrls = await Promise.all(uploadPromises);

      const newImages = imageUrls.map((url, index) => ({
        src: url,
        alt: files[index].name,
        caption: "",
      }));

      onUpdate?.({
        ...block,
        images: [...block.images, ...newImages],
      });
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = block.images.filter((_, i) => i !== index);
    onUpdate?.({ ...block, images: newImages });
  };

  const updateImageCaption = (index: number, caption: string) => {
    const newImages = [...block.images];
    newImages[index] = { ...newImages[index], caption };
    onUpdate?.({ ...block, images: newImages });
  };

  const updateImageAlt = (index: number, alt: string) => {
    const newImages = [...block.images];
    newImages[index] = { ...newImages[index], alt };
    onUpdate?.({ ...block, images: newImages });
  };

  const getGridClass = (columns?: number) => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  if (isEditing) {
    return (
      <div className="content-block-editor border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Image Gallery</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete?.(block.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Upload New Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isUploading}
            />
            {isUploading && (
              <p className="mt-2 text-sm text-gray-500">Uploading images...</p>
            )}
          </div>

          {/* Layout Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout
              </label>
              <select
                value={block.layout || "grid"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    layout: e.target.value as ImageGalleryBlockType["layout"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Columns
              </label>
              <select
                value={block.columns || 3}
                onChange={(e) =>
                  onUpdate?.({ ...block, columns: parseInt(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={1}>1 Column</option>
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
          </div>

          {/* Image List */}
          {block.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images ({block.images.length})
              </label>
              <div className="space-y-3">
                {block.images.map((image, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={80}
                        height={80}
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateImageAlt(index, e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded"
                        placeholder="Alt text"
                      />
                      <input
                        type="text"
                        value={image.caption || ""}
                        onChange={(e) =>
                          updateImageCaption(index, e.target.value)
                        }
                        className="w-full p-2 text-sm border border-gray-300 rounded"
                        placeholder="Caption (optional)"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (block.images.length === 0) {
    return (
      <div className="content-block">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <p>No images in gallery</p>
          <p className="text-sm">Add images to create a gallery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-block">
      <div
        className={`grid gap-6 ${getGridClass(
          block.columns
        )} max-w-6xl w-full mx-auto`}
      >
        {block.images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover object-center"
              />
            </div>
            {image.caption && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
