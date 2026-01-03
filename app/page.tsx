"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Box } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import MobileHome from "@/components/MobileHome";
import { FooterSimple } from "@/components/FooterSimple";
import ImageLightbox from "@/components/ImageLightbox";
// Lightbox is controlled globally by AppShell

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Iconic image placeholder - will be replaced from admin module later

  const [iconicImages, setIconicImages] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch("/api/iconic-images")
      .then((res) => res.json())
      .then((data) => {
        if (
          data.images &&
          Array.isArray(data.images) &&
          data.images.length > 0
        ) {
          setIconicImages(data.images.map((i: any) => i.url));
        }
      })
      .catch((err) => console.error("Failed to fetch iconic images", err));
  }, []);

  // Extract first image for hero, rest for carousel
  const heroImage = iconicImages.length > 0 ? iconicImages[0] : null;
  const displayImages = iconicImages.slice(1); // Remaining images for carousel

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  if (isMobile) {
    return <MobileHome iconicImages={iconicImages} />;
  }

  return (
    <>
      {/* Hero Image - First Iconic Image - Full Viewport Height */}
      {heroImage && (
        <Box
          component="section"
          onClick={() => handleImageClick(0)}
          style={{
            position: "relative",
            width: "100%",
            height: "80vh",
            marginTop: "10vh",
            marginBottom: "10vh",
            padding: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          <Image
            src={heroImage}
            alt="NJ Photography"
            fill
            sizes="100vw"
            style={{
              objectFit: "contain",
            }}
            priority
            unoptimized
          />
        </Box>
      )}

      {/* Iconic Image Carousel Section - Full Viewport Height */}
      {displayImages.length > 0 && (
        <Box
          component="section"
          style={{
            height: "80vh",
            width: "100%",
            padding: 0,
          }}
        >
          <Carousel
            height="80vh"
            slideGap="sm"
            slideSize="66.66%"
            withControls
            emblaOptions={{
              loop: true,
              dragFree: false,
              align: "center",
            }}
            styles={{
              root: {
                height: "100%",
                width: "100%",
              },
              viewport: {
                height: "100%",
                width: "100%",
              },
              slide: {
                height: "100%",
              },
            }}
          >
            {displayImages.map((src, index) => {
              // Add 1 to account for hero image being at index 0
              const actualIndex = index + 1;
              return (
                <Carousel.Slide key={src}>
                  <Box
                    onClick={() => handleImageClick(actualIndex)}
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <Image
                      src={src}
                      alt="NJ Photography"
                      fill
                      sizes="70vw"
                      style={{
                        objectFit: "contain",
                      }}
                      priority={index === 0}
                      unoptimized
                    />
                  </Box>
                </Carousel.Slide>
              );
            })}
          </Carousel>
        </Box>
      )}

      {/* Footer */}
      <FooterSimple />

      {/* Image Lightbox */}
      <ImageLightbox
        images={iconicImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onImageChange={setCurrentImageIndex}
      />
    </>
  );
}
