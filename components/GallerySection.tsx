"use client";

import { useState } from "react";
import { Grid, Paper, Stack, Text, Title, Group, Button } from "@mantine/core";
import GalleryThumbnails from "@/components/GalleryThumbnails";
import ImageManager from "@/components/ImageManager";
import type { UploadButtonConfig } from "@/components/ImageUpload";

interface GallerySectionProps {
  galleryAssets: Array<{ url: string }>;
}

export default function GallerySection({ galleryAssets }: GallerySectionProps) {
  const [uploadButtonConfig, setUploadButtonConfig] =
    useState<UploadButtonConfig | null>(null);

  return (
    <Grid gutter="sm" align="stretch">
      <Grid.Col span={{ base: 12, md: 5, lg: 3 }} style={{ display: "flex" }}>
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
          }}
        >
          <Stack gap="sm" mb="md">
            <Group justify="space-between" align="flex-start" gap="sm">
              <div>
                <Title order={3} size="1.1rem" mb={4}>
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
                  color="dark"
                  loading={uploadButtonConfig.loading}
                  title={uploadButtonConfig.title}
                  size="xs"
                  style={{ alignSelf: "flex-start" }}
                >
                  {uploadButtonConfig.text}
                </Button>
              )}
            </Group>
          </Stack>

          <Stack gap="sm" style={{ flex: 1 }}>
            <ImageManager
              projectId="gallery"
              existingImages={galleryAssets.map((asset) => asset.url)}
              className=""
              showImagesGrid={false}
              onUploadButtonChange={setUploadButtonConfig}
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
          }}
        >
          <div style={{ flex: 1, minHeight: 0 }}>
            <GalleryThumbnails
              initialImages={galleryAssets}
              headerLeft={
                <div>
                  <Title order={3} size="1.1rem" mb={4}>
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
