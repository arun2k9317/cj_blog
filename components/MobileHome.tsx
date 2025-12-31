"use client";

import Image from "next/image";
import { Box } from "@mantine/core";
import { useState } from "react";
import MobileImageLightbox from "./MobileImageLightbox";

interface MobileHomeProps {
  iconicImages?: string[];
}

export default function MobileHome({ iconicImages = [] }: MobileHomeProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // Varying aspect ratios for masonry effect (similar to reference)
  const getAspectRatio = (index: number) => {
    const ratios = [
      "4/3", // Landscape
      "3/4", // Portrait
      "16/9", // Wide landscape
      "4/5", // Slightly portrait
      "5/4", // Slightly landscape
      "1/1", // Square
    ];
    return ratios[index % ratios.length];
  };

  if (iconicImages.length === 0) {
    return (
      <Box p="md" style={{ minHeight: "100svh", paddingBottom: "80px" }}>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            color: "var(--mantine-color-dimmed)",
          }}
        >
          No images available
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        p="md"
        style={{
          minHeight: "100svh",
          paddingBottom: "80px",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* Create two columns manually */}
          {[0, 1].map((colIndex) => (
            <Box
              key={colIndex}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {iconicImages
                .filter((_, index) => index % 2 === colIndex)
                .map((src, filterIndex) => {
                  const actualIndex = filterIndex * 2 + colIndex;
                  const ratio = getAspectRatio(actualIndex);

                  return (
                    <Box
                      key={`${src}-${actualIndex}`}
                      onClick={() => handleImageClick(actualIndex)}
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: ratio,
                        overflow: "hidden",
                        cursor: "pointer",
                        borderRadius: "4px",
                        transition: "transform 0.2s ease, opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(0.98)";
                        e.currentTarget.style.opacity = "0.9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      <Image
                        src={src}
                        alt={`Iconic Image ${actualIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        style={{
                          objectFit: "cover",
                        }}
                        priority={actualIndex < 4}
                        unoptimized
                      />
                    </Box>
                  );
                })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Image Lightbox */}
      <MobileImageLightbox
        images={iconicImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onImageChange={setCurrentImageIndex}
      />
    </>
  );
}
