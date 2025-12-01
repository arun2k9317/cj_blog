"use client";

import { useRouter } from "next/navigation";
import { Box, Button } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import StoryDisplay from "@/components/StoryDisplay";
import { Project } from "@/types/project";
import { useTheme } from "@/contexts/ThemeContext";

interface StoryViewerProps {
  story: Project;
}

export default function StoryViewer({ story }: StoryViewerProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleClose = () => {
    router.push('/');
  };

  return (
    <Box 
      className={`story-viewer-scrollbar ${isDark ? 'dark' : ''}`}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 1000,
        overflow: 'auto',
      }}
      bg={isDark ? 'dark.7' : 'gray.0'}
      c={isDark ? 'gray.0' : 'dark.9'}
    >
        <Button
          onClick={handleClose}
          variant={isDark ? "filled" : "subtle"}
          color={isDark ? "gray" : "dark"}
          leftSection={<IconX size={16} />}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '2rem',
            zIndex: 1001,
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)',
            color: isDark 
              ? 'var(--mantine-color-gray-0)' 
              : 'var(--mantine-color-dark-9)',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid rgba(0, 0, 0, 0.1)',
          }}
          styles={{
            root: {
              '&:hover': {
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          Close
        </Button>
        <StoryDisplay blocks={story.contentBlocks} />
    </Box>
  );
}

