"use client";

import { useState, useEffect, ReactNode, useCallback } from "react";
import Image from "next/image";
import { IconTrash, IconX } from "@tabler/icons-react";
import { Button, Group, Text, SimpleGrid, ScrollArea } from "@mantine/core";

interface GalleryImage {
  id?: string;
  url: string;
  path?: string;
  filename?: string;
}

interface GalleryThumbnailsProps {
  initialImages?: GalleryImage[];
  headerLeft?: ReactNode;
}

const filterGalleryImages = (images: GalleryImage[]): GalleryImage[] =>
  images.filter((asset) => {
    const pathStr = typeof asset.path === "string" ? asset.path : "";
    const urlStr = typeof asset.url === "string" ? asset.url : "";
    const filenameStr =
      typeof asset.filename === "string" ? asset.filename : "";
    return (
      pathStr.includes("gallery") ||
      urlStr.includes("/gallery/") ||
      urlStr.includes("/gallery") ||
      filenameStr.includes("gallery")
    );
  });

const isGalleryImageArray = (value: unknown): value is GalleryImage[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { url?: unknown }).url === "string"
  );

const isGalleryImageResponse = (
  value: unknown
): value is { images: GalleryImage[] } =>
  typeof value === "object" &&
  value !== null &&
  "images" in value &&
  isGalleryImageArray((value as { images: unknown }).images);

export default function GalleryThumbnails({
  initialImages = [],
  headerLeft,
}: GalleryThumbnailsProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchGalleryImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/gallery-images");
      if (response.ok) {
        const data = (await response.json()) as unknown;
        if (isGalleryImageResponse(data)) {
          setImages(data.images);
        } else {
          setImages(filterGalleryImages(initialImages));
        }
      } else {
        setImages(filterGalleryImages(initialImages));
      }
    } catch (error) {
      console.error("Failed to fetch gallery images:", error);
      setImages(filterGalleryImages(initialImages));
    } finally {
      setLoading(false);
    }
  }, [initialImages]);

  // Listen for custom event when image is uploaded
  useEffect(() => {
    const handleImageUploaded = () => {
      // Refresh gallery images after a short delay to allow blob storage to update
      setTimeout(() => {
        void fetchGalleryImages();
      }, 1500);
    };

    window.addEventListener("galleryImageUploaded", handleImageUploaded);
    return () => {
      window.removeEventListener("galleryImageUploaded", handleImageUploaded);
    };
  }, [fetchGalleryImages]);

  // Initial fetch
  useEffect(() => {
    void fetchGalleryImages();
  }, [fetchGalleryImages]);

  const toggleImageSelection = (url: string) => {
    if (!deleteMode) return;

    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${
      selectedImages.size
    } ${
      selectedImages.size === 1 ? "image" : "images"
    }? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    setDeleting(true);
    const urlsToDelete = Array.from(selectedImages);
    const deletePromises = urlsToDelete.map((url) =>
      fetch("/api/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })
    );

    try {
      const results = await Promise.all(deletePromises);
      const failed: string[] = [];

      results.forEach((result, index) => {
        if (!result.ok) {
          failed.push(urlsToDelete[index]);
        }
      });

      if (failed.length > 0) {
        alert(
          `Failed to delete ${failed.length} ${
            failed.length === 1 ? "image" : "images"
          }. Please try again.`
        );
      } else {
        // Remove deleted images from state
        setImages((prev) => prev.filter((img) => !selectedImages.has(img.url)));
        setSelectedImages(new Set());
        setDeleteMode(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting images. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const exitDeleteMode = () => {
    setDeleteMode(false);
    setSelectedImages(new Set());
  };

  const controls = (
    <>
      {deleteMode && selectedImages.size > 0 && (
        <Button
          onClick={handleDeleteSelected}
          disabled={deleting}
          color="red"
          variant="filled"
          size="xs"
          leftSection={<IconTrash size={16} />}
          loading={deleting}
        >
          Delete {selectedImages.size}{" "}
          {selectedImages.size === 1 ? "Image" : "Images"}
        </Button>
      )}
      {deleteMode ? (
        <Button
          onClick={exitDeleteMode}
          variant="outline"
          size="xs"
          leftSection={<IconX size={16} />}
        >
          Cancel
        </Button>
      ) : (
        <Button
          onClick={() => setDeleteMode(true)}
          variant="outline"
          size="xs"
          leftSection={<IconTrash size={16} />}
        >
          Delete
        </Button>
      )}
      <Text size="xs" c="dimmed">
        {images.length} {images.length === 1 ? "image" : "images"}
      </Text>
    </>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Group
        justify={headerLeft ? "space-between" : "flex-end"}
        align="flex-start"
        mb="md"
        gap="xs"
      >
        {headerLeft && <div style={{ flex: 1, minWidth: 0 }}>{headerLeft}</div>}
        <Group gap="xs" wrap="nowrap">
          {controls}
        </Group>
      </Group>
      {loading ? (
        <div
          style={{ padding: "var(--mantine-spacing-xl)", textAlign: "center" }}
        >
          <Text size="sm" c="dimmed">
            Loading images...
          </Text>
        </div>
      ) : images.length === 0 ? (
        <div
          style={{ padding: "var(--mantine-spacing-xl)", textAlign: "center" }}
        >
          <Text size="sm" c="dimmed" mb="xs">
            No images uploaded yet
          </Text>
          <Text size="xs" c="dimmed">
            Upload images to see them here
          </Text>
        </div>
      ) : (
        <ScrollArea offsetScrollbars style={{ flex: 1 }}>
          <SimpleGrid cols={{ base: 3, sm: 4, md: 5, lg: 6 }} spacing="xs">
            {images.map((asset, index) => {
              const isSelected = selectedImages.has(asset.url);
              return (
                <div
                  key={asset.id ?? asset.url ?? index}
                  onClick={() => toggleImageSelection(asset.url)}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    // borderRadius: "var(--mantine-radius-md)",
                    overflow: "hidden",
                    border: `2px solid ${
                      deleteMode
                        ? isSelected
                          ? "var(--mantine-color-blue-5)"
                          : "var(--mantine-color-gray-3)"
                        : "var(--mantine-color-gray-3)"
                    }`,
                    cursor: deleteMode ? "pointer" : "default",
                    transition: "all 0.2s",
                    boxShadow:
                      isSelected && deleteMode
                        ? "0 0 0 2px var(--mantine-color-blue-2)"
                        : "var(--mantine-shadow-sm)",
                  }}
                  onMouseEnter={(e) => {
                    if (!deleteMode) return;
                    if (!isSelected) {
                      e.currentTarget.style.borderColor =
                        "var(--mantine-color-gray-4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deleteMode) return;
                    if (!isSelected) {
                      e.currentTarget.style.borderColor =
                        "var(--mantine-color-gray-3)";
                    }
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      backgroundColor: "var(--mantine-color-gray-1)",
                    }}
                  >
                    <Image
                      src={asset.url}
                      alt={asset.path || "gallery image"}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      unoptimized={asset.url.includes(
                        "blob.vercel-storage.com"
                      )}
                    />
                    {deleteMode && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor: isSelected
                              ? "var(--mantine-color-blue-5)"
                              : "white",
                            backgroundColor: isSelected
                              ? "var(--mantine-color-blue-5)"
                              : "rgba(255, 255, 255, 0.9)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected && (
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              stroke="white"
                              strokeWidth={3}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </SimpleGrid>
        </ScrollArea>
      )}
    </div>
  );
}
