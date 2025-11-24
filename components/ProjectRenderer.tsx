"use client";

import { Project } from "@/types/project";
import { Box, Title, Text, Stack, Divider } from "@mantine/core";
import ContentBlockComponent from "./ContentBlocks/ContentBlock";

interface ProjectRendererProps {
  project: Project;
  className?: string;
}

export default function ProjectRenderer({
  project,
  className = "",
}: ProjectRendererProps) {
  const sortedBlocks = project.contentBlocks.sort((a, b) => a.order - b.order);

  return (
    <Box className={`project-renderer ${className}`}>
      {/* Project Header */}
      <Stack className="project-header" gap="md" align="flex-start" mb="xl">
        <Title order={1} size="xl" className="project-title" c="var(--gray-900)">
          {project.title}
        </Title>

        {project.location && (
          <Text size="lg" c="var(--gray-600)" mb="md">
            {project.location}
          </Text>
        )}

        {project.description && (
          <Text
            size="lg"
            c="var(--gray-700)"
            maw={{ base: "100%", md: "48rem" }}
            mx="auto"
            style={{ lineHeight: 1.75 }}
          >
            {project.description}
          </Text>
        )}
      </Stack>

      {/* Content Blocks */}
      <Stack className="project-content" gap="xl">
        {sortedBlocks.map((block) => (
          <ContentBlockComponent
            key={block.id}
            block={block}
            isEditing={false}
          />
        ))}
      </Stack>

      {/* Project Footer */}
      <Box className="project-footer" mt="xl" pt="md">
        <Divider mb="md" color="var(--gray-200)" />
        <Text size="sm" c="var(--gray-500)" ta="center">
          <Text component="span" display="block">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </Text>
          {project.updatedAt !== project.createdAt && (
            <Text component="span" display="block">
              Updated: {new Date(project.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </Text>
      </Box>
    </Box>
  );
}
