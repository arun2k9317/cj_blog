"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconInfoCircle,

  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { 
    Box, 
    ActionIcon, 
    Group, 
    Drawer, 
    Text, 
    Stack, 
    SimpleGrid,
    UnstyledButton,
    Overlay,
    Transition
} from "@mantine/core";

export interface MobileImageLightboxProps {
  images: string[];
  currentIndex: number;
  imageCaptions?: (string | undefined)[];
  projectInfo?: {
    title: string;
    description?: string;
    location?: string;
    [key: string]: unknown;
  };
  isOpen: boolean;
  onClose: () => void;
  onImageChange?: (index: number) => void;
}

export default function MobileImageLightbox({
  images,
  currentIndex: initialIndex,
  imageCaptions = [],
  projectInfo,
  isOpen,
  onClose,
  onImageChange,
}: MobileImageLightboxProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [infoOpen, setInfoOpen] = useState(false);
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false);

  
  // Sync internal state with prop
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    onImageChange?.(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    onImageChange?.(prevIndex);
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <Box 
        pos="fixed" 
        top={0} 
        left={0} 
        w="100%" 
        h="100%" 
        style={{ 
            zIndex: 2000, 
            backgroundColor: theme === 'dark' ? '#000' : '#fff',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
        {/* Top Bar: Close Button */}
        <Group justify="flex-end" p="md" style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
            <ActionIcon 
                variant="transparent" 
                color={theme === 'dark' ? 'gray.4' : 'gray.8'} 
                onClick={onClose} 
                size="lg"
            >
                <IconX size={28} />
            </ActionIcon>
        </Group>

        {/* Main Image Area */}
        <Box style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
             {/* Touch zones for navigation */}
            <Box 
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '20%', zIndex: 5 }} 
                onClick={handlePrev}
            />
            <Box 
                style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '20%', zIndex: 5 }} 
                onClick={handleNext}
            />

            <Image
                src={currentImage}
                alt={`Image ${currentIndex + 1}`}
                fill
                style={{ 
                    objectFit: "contain",
                    transition: "object-fit 0.3s ease"
                }}
                priority
                sizes="100vw"
            />
        </Box>

        {/* Info Panel (Inline) */}
        {infoOpen && (
            <Box 
                p="md" 
                bg={theme === 'dark' ? 'dark.8' : 'gray.0'} 
                style={{ 
                    borderTop: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                    maxHeight: '30vh', 
                    overflowY: 'auto'
                }}
            >
                <Stack gap="sm">
                     {projectInfo?.title && (
                        <Box>
                            <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb={4}>Project</Text>
                            <Text fw={700} size="md" c={theme === 'dark' ? 'white' : 'black'} style={{ lineHeight: 1.2 }}>
                                {projectInfo.title}
                            </Text>
                        </Box>
                    )}
                    
                    {projectInfo?.description && (
                        <Text size="sm" c={theme === 'dark' ? 'gray.4' : 'gray.7'} style={{ lineHeight: 1.5 }}>
                            {projectInfo.description}
                        </Text>
                    )}

                    {imageCaptions[currentIndex] && (
                        <Box 
                            p="sm" 
                            bg={theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'white'} 
                            style={{ borderRadius: '8px', borderLeft: `3px solid var(--mantine-primary-color)` }}
                        >
                            <Text size="xs" tt="uppercase" c="dimmed" fw={700} mb={2}>Caption</Text>
                            <Text size="sm" c={theme === 'dark' ? 'white' : 'black'} style={{ fontStyle: 'italic' }}>
                                {imageCaptions[currentIndex]}
                            </Text>
                        </Box>
                    )}

                    {projectInfo?.location && (
                         <Group gap="xs" align="center">
                            <Text size="xs" c="dimmed">
                                📍 {projectInfo.location}
                            </Text>
                        </Group>
                    )}
                </Stack>
            </Box>
        )}

        {/* Navigation Controls */}
        <Group 
            justify="space-between" 
            align="center" 
            px="xl" 
            py="xs"
            style={{ 
                zIndex: 10,
                width: '100%',
                backgroundColor: theme === 'dark' ? '#000' : '#fff' // Ensure contrast if info is closed
            }}
        >
             <ActionIcon 
                variant="transparent" 
                size="xl" 
                color={theme === 'dark' ? 'gray.4' : 'gray.8'}
                onClick={handlePrev}
            >
                <IconChevronLeft size={48} stroke={1.5} />
            </ActionIcon>

             <Text size="sm" c="dimmed">
                {currentIndex + 1} / {images.length}
             </Text>

             <ActionIcon 
                variant="transparent" 
                size="xl" 
                color={theme === 'dark' ? 'gray.4' : 'gray.8'}
                onClick={handleNext}
            >
                <IconChevronRight size={48} stroke={1.5} />
            </ActionIcon>
        </Group>

        {/* Bottom Toolbar */}
        <Group 
            justify="center" 
            align="center" 
            p="md" 
            gap="xl"
            style={{ 
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderTop: `1px solid ${theme === 'dark' ? '#333' : '#eee'}`
            }}
        >
            <ActionIcon 
                variant="subtle" 
                size="xl" 
                radius="xl"
                color={theme === 'dark' ? 'gray.4' : 'gray.7'}
                onClick={() => setThumbnailsOpen(true)}
                aria-label="View Thumbnails"
            >
                <IconLayoutGrid size={24} />
            </ActionIcon>



            <ActionIcon 
                variant="subtle" 
                size="xl" 
                radius="xl"
                color={theme === 'dark' ? 'gray.4' : 'gray.7'}
                onClick={() => setInfoOpen((prev) => !prev)}
                aria-label="Image Info"
            >
                <IconInfoCircle size={24} />
            </ActionIcon>

            <ActionIcon 
                variant="subtle" 
                size="xl" 
                radius="xl"
                color={theme === 'dark' ? 'gray.4' : 'gray.7'}
                onClick={toggleTheme}
                aria-label="Toggle Theme"
            >
                {theme === 'dark' ? <IconSun size={24} /> : <IconMoon size={24} />}
            </ActionIcon>
        </Group>

        {/* Thumbnails Drawer */}
        <Drawer 
            opened={thumbnailsOpen} 
            onClose={() => setThumbnailsOpen(false)} 
            position="bottom" 
            size="80%"
            zIndex={2100}
            title={
                <Text fw={600} size="lg">Gallery Preview</Text>
            }
            styles={{
                content: { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff' },
                header: { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff', color: theme === 'dark' ? '#fff' : '#000', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` },
                body: { padding: 0 } // Remove default padding for full edge-to-edge grid
            }}
        >
             <Box p="md" style={{ maxHeight: '100%', overflowY: 'auto' }}>
                <SimpleGrid cols={3} spacing="md" verticalSpacing="md">
                    {images.map((img, idx) => (
                        <Box 
                            key={idx} 
                            style={{ 
                                aspectRatio: '1/1', 
                                position: 'relative', 
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: currentIndex === idx ? '3px solid var(--mantine-primary-color)' : '1px solid transparent',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onClick={() => {
                                setCurrentIndex(idx);
                                onImageChange?.(idx);
                                setThumbnailsOpen(false);
                            }}
                        >
                            <Image 
                                src={img} 
                                alt={`Thumbnail ${idx}`} 
                                fill 
                                style={{ objectFit: 'cover' }} 
                                sizes="33vw"
                            />
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>
        </Drawer>


    </Box>
  );
}
