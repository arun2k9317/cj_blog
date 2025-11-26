"use client";

import { useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import Image from "next/image";
import { IconTrash, IconX, IconSearch } from "@tabler/icons-react";
import {
  Button,
  Group,
  Text,
  SimpleGrid,
  ScrollArea,
  Select,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useTheme } from "@/contexts/ThemeContext";

interface GalleryImage {
  id?: string;
  url: string;
  path?: string;
  filename?: string;
  folder?: string; // Folder name
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
): value is { images: GalleryImage[]; folders?: string[] } =>
  typeof value === "object" &&
  value !== null &&
  "images" in value &&
  isGalleryImageArray((value as { images: unknown }).images);

export default function GalleryThumbnails({
  initialImages = [],
  headerLeft,
}: GalleryThumbnailsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchGalleryImages = useCallback(async () => {
    setLoading(true);
    try {
      // Build URL with folder filter if selected
      const url = selectedFolder
        ? `/api/gallery-images?folder=${encodeURIComponent(selectedFolder)}`
        : "/api/gallery-images";

      const response = await fetch(url);
      if (response.ok) {
        const data = (await response.json()) as unknown;
        if (isGalleryImageResponse(data)) {
          let images = data.images;

          // Sort images by upload date (timestamp in filename) - newest first
          images = images.sort((a, b) => {
            const getTimestamp = (img: GalleryImage): number => {
              // Extract timestamp from filename patterns:
              // 1. {imageName}-{timestamp}.{ext}
              // 2. {timestamp}-{filename}
              const filename = img.filename || img.path || img.url;
              if (!filename) return 0;

              // Try pattern 1: {imageName}-{timestamp}.{ext}
              const match1 = filename.match(/-(\d+)\./);
              if (match1) {
                return parseInt(match1[1], 10);
              }

              // Try pattern 2: {timestamp}-{filename}
              const match2 = filename.match(/^(\d+)-/);
              if (match2) {
                return parseInt(match2[1], 10);
              }

              // Fallback: try to extract from URL path
              const urlMatch = img.url.match(/-(\d+)\./);
              if (urlMatch) {
                return parseInt(urlMatch[1], 10);
              }

              return 0;
            };

            const timestampA = getTimestamp(a);
            const timestampB = getTimestamp(b);

            // Descending order (newest first)
            return timestampB - timestampA;
          });

          setImages(images);
          // Update folders list if available
          if (typeof data === "object" && data !== null && "folders" in data) {
            const foldersList = (data as { folders?: string[] }).folders;
            if (Array.isArray(foldersList)) {
              setFolders(foldersList);
            }
          }
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
  }, [initialImages, selectedFolder]);

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

  // Filter images by search term
  const filteredImages = useMemo(() => {
    if (!searchTerm.trim()) {
      return images;
    }
    const search = searchTerm.toLowerCase();
    return images.filter((img) => {
      const filename = img.filename?.toLowerCase() || "";
      const path = img.path?.toLowerCase() || "";
      const url = img.url.toLowerCase();
      return (
        filename.includes(search) ||
        path.includes(search) ||
        url.includes(search)
      );
    });
  }, [images, searchTerm]);

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

    const confirmMessage = `Are you sure you want to delete ${
      deletable.length
    } ${
      deletable.length === 1 ? "image" : "images"
    }? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    setDeleting(true);
    const deletePromises = deletable.map((url) =>
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
          failed.push(deletable[index]);
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
        setImages((prev) => prev.filter((img) => !deletable.includes(img.url)));
        setSelectedImages((prev) => {
          const next = new Set(prev);
          deletable.forEach((url) => next.delete(url));
          return next;
        });
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
      <Text
        size="xs"
        c={isDark ? "var(--mantine-color-gray-3)" : "dimmed"}
        style={{
          color: isDark ? "var(--mantine-color-gray-3)" : undefined,
        }}
      >
        {filteredImages.length} / {images.length}{" "}
        {filteredImages.length === 1 ? "image" : "images"}
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

      {/* Folder filter and search */}
      <Group gap="xs" mb="md" align="flex-end">
        <Select
          placeholder="All folders"
          data={[
            { value: "", label: "All folders" },
            ...folders.map((f) => ({ value: f, label: f })),
          ]}
          value={selectedFolder || ""}
          onChange={(value) => setSelectedFolder(value || null)}
          style={{ flex: 1, maxWidth: 200 }}
          size="xs"
          clearable
          styles={{
            input: {
              color: isDark
                ? "var(--mantine-color-gray-0)"
                : "var(--mantine-color-dark-9)",
              backgroundColor: isDark
                ? "var(--mantine-color-dark-5)"
                : "var(--mantine-color-white)",
            },
            dropdown: {
              backgroundColor: isDark
                ? "var(--mantine-color-dark-6)"
                : "var(--mantine-color-white)",
            },
            option: {
              color: isDark
                ? "var(--mantine-color-gray-0)"
                : "var(--mantine-color-dark-9)",
              backgroundColor: isDark
                ? "var(--mantine-color-dark-6)"
                : "var(--mantine-color-white)",
              "&:hover": {
                backgroundColor: isDark
                  ? "var(--mantine-color-dark-5)"
                  : "var(--mantine-color-gray-1)",
              },
            },
          }}
        />
        <TextInput
          placeholder="Search images..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
          size="xs"
        />
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
      ) : filteredImages.length === 0 ? (
        <div
          style={{ padding: "var(--mantine-spacing-xl)", textAlign: "center" }}
        >
          <Text size="sm" c="dimmed" mb="xs">
            No images match your search
          </Text>
          <Text size="xs" c="dimmed">
            Try adjusting your search or folder filter
          </Text>
        </div>
      ) : (
        <ScrollArea offsetScrollbars style={{ flex: 1 }}>
          <SimpleGrid cols={{ base: 5, sm: 6, md: 8, lg: 10 }} spacing="xs">
            {filteredImages.map((asset, index) => {
              const isSelected = selectedImages.has(asset.url);
              const tooltipLabel = asset.folder
                ? `${
                    asset.filename || asset.path?.split("/").pop() || "Image"
                  } (${asset.folder})`
                : asset.filename || asset.path || "Image";

              return (
                <Tooltip
                  key={asset.id ?? asset.url ?? index}
                  label={tooltipLabel}
                  position="top"
                  withArrow
                  offset={8}
                  multiline
                  w={400}
                  styles={{
                    tooltip: {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-4)"
                        : "var(--mantine-color-gray-9)",
                      color: isDark
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-white)",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      borderRadius: "var(--mantine-radius-md)",
                      boxShadow: "var(--mantine-shadow-md)",
                    },
                    arrow: {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-4)"
                        : "var(--mantine-color-gray-9)",
                    },
                  }}
                >
                  <div
                    onClick={() => toggleImageSelection(asset.url)}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      overflow: "hidden",
                      border:
                        deleteMode && isSelected
                          ? "2px solid var(--mantine-color-blue-5)"
                          : "none",
                      cursor: deleteMode ? "pointer" : "default",
                      transition: "all 0.2s",
                      boxShadow:
                        isSelected && deleteMode
                          ? "0 0 0 2px var(--mantine-color-blue-2)"
                          : "var(--mantine-shadow-sm)",
                      borderRadius: "var(--mantine-radius-sm)",
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
                        loading={index < 12 ? "eager" : "lazy"}
                        quality={85}
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
                </Tooltip>
              );
            })}
          </SimpleGrid>
        </ScrollArea>
      )}
    </div>
  );
}
