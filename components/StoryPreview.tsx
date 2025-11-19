"use client";

import { useState, useEffect } from "react";
import { Modal, Loader, Text, Button } from "@mantine/core";
import StoryDisplay from "./StoryDisplay";
import type { Project } from "@/types/project";
import { useTheme } from "@/contexts/ThemeContext";

interface StoryPreviewProps {
  storyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryPreview({
  storyId,
  isOpen,
  onClose,
}: StoryPreviewProps) {
  const [story, setStory] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!isOpen || !storyId) return;

    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${encodeURIComponent(storyId)}`);
        if (!response.ok) {
          throw new Error("Failed to load story");
        }
        const data = (await response.json()) as { project?: Project };
        if (data.project) {
          setStory(data.project);
        } else {
          setError("Story not found");
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        setError(err instanceof Error ? err.message : "Failed to load story");
      } finally {
        setLoading(false);
      }
    };

    void fetchStory();
  }, [isOpen, storyId]);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={story?.title || "Story Preview"}
      size="xl"
      fullScreen
      styles={{
        content: {
          backgroundColor: isDark
            ? "var(--mantine-color-dark-7)"
            : "var(--mantine-color-gray-0)",
        },
        header: {
          backgroundColor: isDark
            ? "var(--mantine-color-dark-7)"
            : "var(--mantine-color-gray-0)",
        },
        body: {
          backgroundColor: isDark
            ? "var(--mantine-color-dark-7)"
            : "var(--mantine-color-gray-0)",
          padding: 0,
        },
      }}
    >
      {loading && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Loader size="lg" />
        </div>
      )}

      {error && (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Text c="red" mb="md">
            {error}
          </Text>
          <Button onClick={onClose}>Close</Button>
        </div>
      )}

      {!loading && !error && story && (
        <StoryDisplay blocks={story.contentBlocks} />
      )}
    </Modal>
  );
}

