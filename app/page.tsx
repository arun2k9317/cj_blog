"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tab } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hoverRegion, setHoverRegion] = useState<
    "left" | "middle" | "right" | null
  >(null);
  const router = useRouter();

  // Random images from Vercel Blob projects (click to navigate to project)
  const BLOB_BASE =
    "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

  const images = useMemo(() => {
    type P = {
      slug: string;
      name: string;
      folder: string;
      prefix: string;
      count: number;
      extension?: string;
    };
    const projects: P[] = [
      {
        slug: "behind-the-tea-cup",
        name: "Behind The Tea Cup",
        folder: "behindTheTeaCup",
        prefix: "behindTheTeaCup_",
        count: 10,
      },
      {
        slug: "coffee-and-the-hills",
        name: "Coffee And The Hills",
        folder: "coffeeAndTheHills",
        prefix: "coffeeAndTheHills_",
        count: 16,
      },
      {
        slug: "dusk-falls-on-mountains",
        name: "Dusk Falls On Mountains",
        folder: "duskFallsOnMountains",
        prefix: "duskFallsOnMountains_",
        count: 7,
      },
      {
        slug: "kalaripayattu",
        name: "kalaripayattu",
        folder: "kalaripayattu",
        prefix: "kalaripayattu_",
        count: 15,
        extension: "JPG",
      },
    ];
    const all: { src: string; alt: string; href: string }[] = [];
    for (const p of projects) {
      const ext = p.extension || "jpg";
      for (let i = 1; i <= p.count; i++) {
        all.push({
          src: `${BLOB_BASE}/${p.folder}/${p.prefix}${i}.${ext}`,
          alt: p.name,
          href: `/projects/${p.slug}`,
        });
      }
    }
    // Deterministic shuffle to avoid SSR/CSR hydration mismatch
    const rng = (() => {
      let a = 0x12345678; // fixed seed
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    // show a reasonable subset for performance
    return all.slice(0, 20);
  }, []);

  // Auto-advance slideshow (only when not showing thumbnails or hovering)
  useEffect(() => {
    if (!showThumbnails && !isHovering) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [images.length, showThumbnails, isHovering]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  // thumbnails navigate directly to project; no local selection function needed

  return (
    <div
      className={`main-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* Left Sidebar */}
      <aside className="sidebar">
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarCollapsed((v) => !v)}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          )}
        </button>
        <div className="sidebar-logo">
          <div className="sidebar-logo-row">
            <span>NJ</span>
            <Image
              src="/logo.png"
              alt="NJ Photography Logo"
              width={40}
              height={40}
            />
          </div>
          <span>PHOTOGRAPHY</span>
        </div>

        <nav>
          <ul className="sidebar-nav">
            <li>
              <Link href="/">Portfolio</Link>
            </li>
            <li>
              <Link href="/projects">Projects</Link>
            </li>
            <li>
              <Link href="/art">Art</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-social">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.948-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        </div>

        {/* Sidebar Controls */}
        <div className="sidebar-controls">
          <Tab.Group>
            <Tab.List className="sidebar-tab-list">
              <Tab className="sidebar-tab" onClick={prevSlide}>
                PREV
              </Tab>
              <Tab className="sidebar-tab" onClick={nextSlide}>
                NEXT
              </Tab>
              <Tab
                className="sidebar-tab"
                onClick={() => setShowThumbnails(!showThumbnails)}
              >
                {showThumbnails ? "BACK TO SLIDESHOW" : "SHOW THUMBNAILS"}
              </Tab>
            </Tab.List>
          </Tab.Group>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {!showThumbnails ? (
          <>
            <section
              className={`gallery-container ${
                hoverRegion === "left"
                  ? "cursor-left"
                  : hoverRegion === "right"
                  ? "cursor-right"
                  : hoverRegion === "middle"
                  ? "cursor-middle"
                  : ""
              }`}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => {
                setIsHovering(false);
                setHoverRegion(null);
              }}
              onMouseMove={(e) => {
                const rect = (
                  e.currentTarget as HTMLElement
                ).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const ratio = x / rect.width;
                if (ratio < 1 / 3) {
                  setHoverRegion("left");
                } else if (ratio > 2 / 3) {
                  setHoverRegion("right");
                } else {
                  setHoverRegion("middle");
                }
              }}
              onClick={(e) => {
                const rect = (
                  e.currentTarget as HTMLElement
                ).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const ratio = x / rect.width;
                if (ratio < 1 / 3) {
                  prevSlide();
                  return;
                }
                if (ratio > 2 / 3) {
                  nextSlide();
                  return;
                }
                const href = images[currentSlide]?.href || "/projects";
                router.push(href);
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`gallery-slide ${
                    index === currentSlide ? "active" : ""
                  }`}
                  style={{
                    backgroundImage: `url(${image.src})`,
                  }}
                />
              ))}
            </section>
            <div className="gallery-caption">{images[currentSlide]?.alt}</div>
          </>
        ) : (
          <>
            <section className="thumbnail-grid-container">
              <div className="thumbnail-grid">
                {images.map((image, index) => (
                  <Link
                    key={index}
                    href={image.href}
                    className={`thumbnail-item ${
                      index === currentSlide ? "active" : ""
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      className="thumbnail-image"
                      width={400}
                      height={300}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="thumb-overlay" aria-hidden>
                      <div className="thumb-overlay-title">{image.alt}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Content Section */}
        <section className="content-section">
          <div className="content-text">
            <h1>Portfolio</h1>
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
              traditions, or discovering hidden artistic gems in urban
              landscapes, we bring a fresh perspective to visual storytelling
              that honors both the grandeur and intimacy of our world.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
