"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Box, Text, Stack } from "@mantine/core";


interface MobileHomeProps {
  iconicImages?: string[];
}

import { useState, useEffect } from "react";

export default function MobileHome({ iconicImages = [] }: MobileHomeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const displayImages = iconicImages;

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % displayImages.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [displayImages]);

  const projects = useMemo(
    () => [
      {
        id: "behindTheTeaCup",
        title: "Behind The Tea Cup",
        folder: "behindTheTeaCup",
        description: "Behind The Tea Cup photo series.",
        count: 10,
        ext: "jpg",
      },
      {
        id: "coffee-and-the-hills",
        title: "Coffee And The Hills",
        folder: "coffeeAndTheHills",
        description: "Coffee And The Hills photo series.",
        count: 16,
        ext: "jpg",
      },
    ],
    []
  );

  const openGlobalLightbox = (seriesId: string | null) => {
    const evt = new CustomEvent<string | null>("open-series-lightbox", {
      detail: seriesId,
    });
    window.dispatchEvent(evt);
  };

  return (
    <Box p="md" style={{ minHeight: "100svh", paddingBottom: "80px" }}>
      <Stack gap="xl">
        <Box>
          {/* <Text size="xl" fw={700} mb="sm">
            Overview
          </Text> */}
          <Box
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3/4",
              overflow: "hidden",
            }}
          >
            {displayImages.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt="Featured Image"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ 
                      objectFit: "cover",
                      opacity: index === currentIndex ? 1 : 0,
                      transition: "opacity 1s ease-in-out",
                      zIndex: index === currentIndex ? 1 : 0,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                  }}
                  priority={index === 0}
                />
            ))}
            <Box
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                color: "white",
              }}
            >
              <Text size="lg" fw={500}>
                {projects[0].title}
              </Text>
              <Text size="sm" opacity={0.9}>
                {projects[0].description}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* <Box>
          <Text size="xl" fw={700} mb="sm">
            Latest Series
          </Text>
          <Stack gap="md">
            {projects.map((project) => (
              <Box
                key={project.id}
                onClick={() => openGlobalLightbox(project.id)}
                style={{
                  display: "flex",
                  gap: "12px",
                  cursor: "pointer",
                  backgroundColor: "var(--mantine-color-body)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                 <Box
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "80px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={`${BLOB_BASE}/${project.folder}/${project.folder}_1.${project.ext}`}
                    alt={project.title}
                    fill
                    sizes="80px"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Box py="xs" style={{ flex: 1 }}>
                  <Text fw={600} lineClamp={1}>
                    {project.title}
                  </Text>
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {project.description}
                  </Text>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box> */}
      </Stack>
    </Box>
  );
}
