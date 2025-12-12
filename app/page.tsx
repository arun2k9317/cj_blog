"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import MobileHome from "@/components/MobileHome";
// Lightbox is controlled globally by AppShell

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Iconic image placeholder - will be replaced from admin module later


  const [iconicImages, setIconicImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/iconic-images")
      .then((res) => res.json())
      .then((data) => {
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
             setIconicImages(data.images.map((i: any) => i.url));
        }
      })
      .catch((err) => console.error("Failed to fetch iconic images", err));
  }, []);

  const displayImages = iconicImages;

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % displayImages.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [displayImages]);





  if (isMobile) {
    return <MobileHome iconicImages={iconicImages} />;
  }

  return (
    <>
      {/* Iconic Image Section */}
      <Box
        component="section"
        className="iconic-image-container"
        style={{ height: "90svh", margin: 0, padding: 0, overflow: "hidden" }}
      >
        <Box
          className="iconic-image-wrapper"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {displayImages.map((src, index) => (
             <Image
                key={src}
                src={src}
                alt="NJ Photography"
                fill
                sizes="100vw"
                style={{ 
                    objectFit: "cover",
                    opacity: index === currentIndex ? 1 : 0,
                    transition: "opacity 1s ease-in-out",
                    zIndex: index === currentIndex ? 1 : 0,
                    position: 'absolute',
                    top: 0,
                    left: 0
                }}
                className="iconic-image"
                priority={index === 0}
              />
          ))}
        </Box>
      </Box>

      {/* Image Lightbox handled globally */}
    </>
  );
}
