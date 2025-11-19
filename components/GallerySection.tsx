"use client";

import { useState, useEffect } from "react";
import { Grid, Paper, Stack, Text, Title, Group, Button } from "@mantine/core";
import { useTheme } from "@/contexts/ThemeContext";
import GalleryThumbnails from "@/components/GalleryThumbnails";
import ImageManager from "@/components/ImageManager";
import type { UploadButtonConfig } from "@/components/ImageUpload";

interface GallerySectionProps {
  galleryAssets: Array<{ url: string }>;
}

export default function GallerySection({ galleryAssets }: GallerySectionProps) {
  const [uploadButtonConfig, setUploadButtonConfig] =
    useState<UploadButtonConfig | null>(null);
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Fetch folders from API
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/gallery-images");
        if (response.ok) {
          const data = (await response.json()) as { folders?: string[] };
          if (data.folders) {
            setAvailableFolders(data.folders);
          }
        }
      } catch (error) {
        console.error("Failed to fetch folders:", error);
      }
    };
    void fetchFolders();
  }, []);

  const handleFoldersChange = (folders: string[]) => {
    setAvailableFolders(folders);
  };

  return (
    <Grid gutter="sm" align="stretch">
      <Grid.Col span={{ base: 12, md: 5, lg: 3 }} style={{ display: "flex" }}>
        <Paper
          shadow="xs"
          p="md"
          radius="md"
          withBorder
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 100px)",
            overflow: "hidden",
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
            borderColor: isDark
              ? "var(--mantine-color-dark-4)"
              : "var(--mantine-color-gray-3)",
          }}
        >
          <Group justify="space-between" align="flex-start" mb="xs" gap="xs">
            <div>
              <Title
                order={3}
                size="0.95rem"
                mb={2}
                c={
                  isDark
                    ? "var(--mantine-color-gray-0)"
                    : "var(--mantine-color-dark-9)"
                }
              >
                Gallery Uploads
              </Title>
              <Text size="xs" c="dimmed">
                Upload images to the &quot;gallery&quot; folder
              </Text>
            </div>
            {uploadButtonConfig && (
              <Button
                onClick={uploadButtonConfig.onClick}
                disabled={uploadButtonConfig.disabled}
                variant={uploadButtonConfig.variant}
                color={isDark ? "gray" : "dark"}
                loading={uploadButtonConfig.loading}
                title={uploadButtonConfig.title}
                size="xs"
              >
                {uploadButtonConfig.text}
              </Button>
            )}
          </Group>

          <Stack gap="xs" style={{ flex: 1 }}>
            <ImageManager
              projectId="gallery"
              existingImages={galleryAssets.map((asset) => asset.url)}
              className=""
              showImagesGrid={false}
              onUploadButtonChange={setUploadButtonConfig}
              availableFolders={availableFolders}
              onFoldersChange={handleFoldersChange}
            />
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 7, lg: 9 }} style={{ display: "flex" }}>
        <Paper
          shadow="xs"
          p="lg"
          radius="md"
          withBorder
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 120px)",
            overflow: "hidden",
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
            borderColor: isDark
              ? "var(--mantine-color-dark-4)"
              : "var(--mantine-color-gray-3)",
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <GalleryThumbnails
              initialImages={galleryAssets}
              headerLeft={
                <div>
                  <Title
                    order={3}
                    size="1.1rem"
                    mb={4}
                    c={
                      isDark
                        ? "var(--mantine-color-gray-0)"
                        : "var(--mantine-color-dark-9)"
                    }
                  >
                    Gallery Images
                  </Title>
                  <Text size="xs" c="dimmed">
                    View and manage uploaded images
                  </Text>
                </div>
              }
            />
          </div>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
