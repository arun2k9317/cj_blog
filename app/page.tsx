"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
// Lightbox is controlled globally by AppShell

export default function Home() {
  // Iconic image placeholder - will be replaced from admin module later
  const BLOB_BASE =
    "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

  // Temporary iconic image (can be changed from admin later)
  const iconicImage = `${BLOB_BASE}/behindTheTeaCup/behindTheTeaCup_1.jpg`;

  type Series = {
    id: string;
    title: string;
    folder: string;
    description: string;
    count: number;
    ext: string;
  };

  // Projects catalog (can be replaced by admin-managed data later)
  const projects = useMemo<Series[]>(
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

  const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

  const activeProject: Series = useMemo(() => projects[0], [projects]);

  const openGlobalLightbox = (seriesId: string | null) => {
    const evt = new CustomEvent<string | null>("open-series-lightbox", {
      detail: seriesId,
    });
    window.dispatchEvent(evt);
  };

  return (
    <>
      {/* Iconic Image Section */}
      <section className="iconic-image-container">
        <div
          className="iconic-image-wrapper"
          onClick={() => openGlobalLightbox(activeProject.id)}
          style={{ cursor: "pointer" }}
        >
          <Image
            src={iconicImage}
            alt="NJ Photography"
            width={1400}
            height={900}
            className="iconic-image"
            priority
          />
        </div>
      </section>

      {/* Image Lightbox handled globally */}

      {/* Content Section */}
      <section className="content-section">
        <div className="content-text">
          <h1>NJ Photography</h1>
          <p>
            <strong>NJ Photography</strong> is passionate about capturing the
            world&apos;s diverse beauty through nature, culture, arts, and
            places. Our work celebrates the intricate details of natural
            landscapes, the vibrant expressions of human culture, and the
            artistic essence found in everyday moments and extraordinary
            destinations.
          </p>
          <p>
            From the serene majesty of untouched wilderness to the bustling
            energy of cultural festivals, we document the stories that connect
            us to our planet and each other. Our approach blends documentary
            authenticity with artistic vision, creating images that inspire
            wonder and preserve memories of the world&apos;s most precious
            moments.
          </p>
          <p>
            Whether exploring remote natural wonders, immersing in local
            traditions, or discovering hidden artistic gems in urban landscapes,
            we bring a fresh perspective to visual storytelling that honors both
            the grandeur and intimacy of our world.
          </p>
        </div>
      </section>
    </>
  );
}
