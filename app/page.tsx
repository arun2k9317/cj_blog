"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Box } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useMediaQuery } from "@mantine/hooks";
import MobileHome from "@/components/MobileHome";
// Lightbox is controlled globally by AppShell

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Iconic image placeholder - will be replaced from admin module later

  const [iconicImages, setIconicImages] = useState<string[]>([]);

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

  if (isMobile) {
    return <MobileHome iconicImages={iconicImages} />;
  }

  return (
    <>
      {/* Hero Image - First Iconic Image */}
      {heroImage && (
        <Box
          component="section"
          style={{
            position: "relative",
            width: "100%",
            height: "60svh",
            margin: 0,
            padding: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor: "var(--mantine-color-body)",
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
          />
        </Box>
      )}

      {/* Iconic Image Carousel Section */}
      {displayImages.length > 0 && (
        <Box
          component="section"
          style={{
            height: "60svh",
            width: "100%",
            marginTop: "20px",
            padding: 0,
          }}
        >
          <Carousel
            // slideSize="70%"
            height="60svh"
            slideGap="sm"
            slideSize="70%"
            withIndicators
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
            {displayImages.map((src, index) => (
              <Carousel.Slide key={src}>
                <Box
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // backgroundColor: "var(--mantine-color-body)",
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
                  />
                </Box>
              </Carousel.Slide>
            ))}
          </Carousel>
        </Box>
      )}

      {/* Image Lightbox handled globally */}
    </>
  );
}
