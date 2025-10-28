"use client";

import { ImageBlock as ImageBlockType } from "@/types/project";
import { useState } from "react";
import Image from "next/image";

interface ImageBlockProps {
  block: ImageBlockType;
  isEditing?: boolean;
  onUpdate?: (block: ImageBlockType) => void;
  onDelete?: (blockId: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function ImageBlock({
  block,
  isEditing = false,
  onUpdate,
  onDelete,
  onImageUpload,
}: ImageBlockProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState(block.caption || "");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      onUpdate?.({ ...block, src: imageUrl });
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCaptionSave = () => {
    onUpdate?.({ ...block, caption });
  };

  const handleCaptionCancel = () => {
    setCaption(block.caption || "");
  };

  const getAspectRatioClass = (ratio?: string) => {
    switch (ratio) {
      case "square":
        return "aspect-square";
      case "landscape":
        return "aspect-video";
      case "portrait":
        return "aspect-[3/4]";
      case "wide":
        return "aspect-[21/9]";
      default:
        return "aspect-auto";
    }
  };

  const getAlignmentClass = (alignment?: string) => {
    switch (alignment) {
      case "left":
        return "mx-0 mr-auto";
      case "right":
        return "mx-0 ml-auto";
      case "center":
        return "mx-auto";
      case "full-width":
        return "w-full";
      default:
        return "mx-auto";
    }
  };

  if (isEditing) {
    return (
      <div className="content-block-editor border border-gray-300 rounded-lg p-4 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">Image Block</h3>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete?.(block.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            {block.src ? (
              <div className="relative">
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={300}
                  height={200}
                  className="rounded-md object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploading}
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                )}
              </div>
            )}
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={block.alt}
              onChange={(e) => onUpdate?.({ ...block, alt: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the image for accessibility"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onBlur={handleCaptionSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCaptionSave();
                if (e.key === "Escape") handleCaptionCancel();
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a caption for the image"
            />
          </div>

          {/* Layout Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aspect Ratio
              </label>
              <select
                value={block.aspectRatio || "auto"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    aspectRatio: e.target
                      .value as ImageBlockType["aspectRatio"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="auto">Auto</option>
                <option value="square">Square</option>
                <option value="landscape">Landscape (16:9)</option>
                <option value="portrait">Portrait (3:4)</option>
                <option value="wide">Wide (21:9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <select
                value={block.alignment || "center"}
                onChange={(e) =>
                  onUpdate?.({
                    ...block,
                    alignment: e.target.value as ImageBlockType["alignment"],
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="full-width">Full Width</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!block.src) {
    return (
      <div className="content-block">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <p>No image selected</p>
          <p className="text-sm">Click to upload an image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-block">
      <div
        className={`relative ${getAlignmentClass(block.alignment)} ${
          block.alignment === "full-width" ? "w-full" : "max-w-6xl w-full"
        }`}
      >
        <div
          className={`relative overflow-hidden ${getAspectRatioClass(
            block.aspectRatio
          )}`}
        >
          <Image
            src={block.src}
            alt={block.alt}
            fill
            className="object-cover object-center"
          />
        </div>

        {block.caption && (
          <p className="mt-2 text-sm text-gray-600 text-center italic">
            {block.caption}
          </p>
        )}
      </div>
    </div>
  );
}
