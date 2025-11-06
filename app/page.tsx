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
      <section
        className="iconic-image-container"
        style={{ height: "90svh", margin: 0, padding: 0, overflow: "hidden" }}
      >
        <div
          className="iconic-image-wrapper"
          onClick={() => openGlobalLightbox(activeProject.id)}
          style={{
            cursor: "pointer",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            src={iconicImage}
            alt="NJ Photography"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            className="iconic-image"
            priority
          />
        </div>
      </section>

      {/* Image Lightbox handled globally */}
    </>
  );
}
