"use client";

import { useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import { IconTrash, IconX } from "@tabler/icons-react";
import { Button, Group, Text, SimpleGrid, ScrollArea } from "@mantine/core";

interface GalleryThumbnailsProps {
  initialImages?: Array<{ id?: string; url: string; path?: string }>;
  headerLeft?: ReactNode;
}

export default function GalleryThumbnails({
  initialImages = [],
  headerLeft,
}: GalleryThumbnailsProps) {
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      // Fetch all assets and filter for gallery
      const response = await fetch("/api/gallery-images");
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        // Fallback: filter initial images
        const galleryImages = (initialImages || []).filter((a: any) => {
          const path = a?.path || "";
          const url = a?.url || "";
          const filename = a?.filename || "";
          const pathStr = typeof path === "string" ? path : "";
          const urlStr = typeof url === "string" ? url : "";
          const filenameStr = typeof filename === "string" ? filename : "";
          return (
            pathStr.includes("gallery") ||
            urlStr.includes("/gallery/") ||
            urlStr.includes("/gallery") ||
            filenameStr.includes("gallery")
          );
        });
        setImages(galleryImages);
      }
    } catch (error) {
      console.error("Failed to fetch gallery images:", error);
      // Fallback to initial images filtered
      const galleryImages = (initialImages || []).filter((a: any) => {
        const url = a?.url || "";
        return (
          typeof url === "string" &&
          (url.includes("/gallery/") || url.includes("/gallery"))
        );
      });
      setImages(galleryImages);
    } finally {
      setLoading(false);
    }
  };

  // Listen for custom event when image is uploaded
  useEffect(() => {
    const handleImageUploaded = () => {
      // Refresh gallery images after a short delay to allow blob storage to update
      setTimeout(() => {
        fetchGalleryImages();
      }, 1500);
    };

    window.addEventListener("galleryImageUploaded", handleImageUploaded);
    return () => {
      window.removeEventListener("galleryImageUploaded", handleImageUploaded);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGalleryImages();
  }, []);

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
            {images.map((a: any, index: number) => {
              const isSelected = selectedImages.has(a.url);
              return (
                <div
                  key={a.id ?? a.url ?? index}
                  onClick={() => toggleImageSelection(a.url)}
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
                      src={a.url}
                      alt={a.path || "gallery image"}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      unoptimized={a.url.includes("blob.vercel-storage.com")}
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
