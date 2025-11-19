"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Badge, Group, Text, Card, Modal, Stack } from "@mantine/core";
import { IconEye, IconWorld } from "@tabler/icons-react";
import { useTheme } from "@/contexts/ThemeContext";
import ProjectPreview from "./ProjectPreview";

interface ProjectCardProps {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  published?: boolean | null;
}

export default function ProjectCard({
  id,
  title,
  slug,
  featuredImage,
  published,
}: ProjectCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handlePublishClick = () => {
    setConfirmOpen(true);
  };

  const handlePublish = async () => {
    try {
      setConfirmOpen(false);
      setPublishing(true);
      const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: !published,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update publish status");
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (error) {
      console.error("Error publishing project:", error);
      alert("Failed to update publish status. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <Card
        shadow="xs"
        padding="md"
        radius="md"
        withBorder
        style={{
          backgroundColor: isDark
            ? "var(--mantine-color-dark-5)"
            : "var(--mantine-color-white)",
          borderColor: isDark
            ? "var(--mantine-color-dark-4)"
            : "var(--mantine-color-gray-3)",
        }}
      >
        <Group justify="space-between" mb="xs" gap="xs">
          <Text
            fw={500}
            size="sm"
            c={isDark ? "var(--mantine-color-gray-0)" : "var(--mantine-color-dark-9)"}
          >
            {title}
          </Text>
          <Badge
            color={published ? "green" : "yellow"}
            variant="light"
            size="xs"
          >
            {published ? "Published" : "Draft"}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">
          {slug}
        </Text>
        {featuredImage ? (
          <div
            style={{
              position: "relative",
              marginBottom: "var(--mantine-spacing-sm)",
              height: "140px",
              width: "100%",
              overflow: "hidden",
              borderRadius: "var(--mantine-radius-md)",
              backgroundColor: isDark
                ? "var(--mantine-color-dark-4)"
                : "var(--mantine-color-gray-1)",
            }}
          >
            <Image
              src={featuredImage}
              alt={title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : null}
        <Group gap="xs" mt="sm">
          <Link href={`/admin/edit/${encodeURIComponent(id)}`}>
            <Button variant="filled" color={isDark ? "gray" : "dark"} size="xs">
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="xs"
            color={isDark ? "gray" : "dark"}
            leftSection={<IconEye size={14} />}
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button
            variant={published ? "outline" : "filled"}
            size="xs"
            color={published ? "gray" : "green"}
            leftSection={<IconWorld size={14} />}
            onClick={handlePublishClick}
            loading={publishing}
            disabled={publishing}
          >
            {published ? "Unpublish" : "Publish"}
          </Button>
        </Group>
      </Card>

      <ProjectPreview
        projectId={id}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={published ? "Unpublish Project" : "Publish Project"}
        centered
        styles={{
          content: {
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
          },
          header: {
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
          },
          body: {
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
          },
        }}
      >
        <Stack gap="md">
          <Text
            size="sm"
            c={isDark ? "var(--mantine-color-gray-0)" : "var(--mantine-color-dark-9)"}
          >
            {published
              ? `Are you sure you want to unpublish "${title}"? It will no longer be visible on the public website.`
              : `Are you sure you want to publish "${title}"? It will be visible on the public website.`}
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setConfirmOpen(false)}
              disabled={publishing}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              color={published ? "red" : "green"}
              onClick={handlePublish}
              loading={publishing}
              disabled={publishing}
            >
              {published ? "Unpublish" : "Publish"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

