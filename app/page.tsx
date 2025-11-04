"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageLightbox from "@/components/ImageLightbox";

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);

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

  // Stories submenu items (reuse lightbox)
  const stories = useMemo<Series[]>(
    () => [
      {
        id: "dusk-falls-on-mountains",
        title: "Dusk Falls On Mountains",
        folder: "duskFallsOnMountains",
        description: "Dusk Falls On Mountains photo series.",
        count: 7,
        ext: "jpg",
      },
      {
        id: "kalaripayattu",
        title: "Kalaripayattu",
        folder: "kalaripayattu",
        description: "kalaripayattu photo series.",
        count: 15,
        ext: "JPG",
      },
    ],
    []
  );

  const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

  const allSeries = useMemo<Series[]>(() => [...projects, ...stories], [projects, stories]);

  const activeProject: Series = useMemo(() => {
    const found = allSeries.find((p) => p.id === selectedProjectId);
    return found ?? projects[0];
  }, [allSeries, selectedProjectId, projects]);

  const projectImages = useMemo(() => {
    const total = activeProject.count;
    const ext = activeProject.ext;
    return range(total).map(
      (i) => `${BLOB_BASE}/${activeProject.folder}/${activeProject.folder}_${i}.${ext}`
    );
  }, [BLOB_BASE, activeProject]);

  const projectInfo = {
    title: activeProject.title,
    description: activeProject.description,
    location: "",
  };

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
              <Link href="/" className="active">Home</Link>
            </li>
            <li>
              <button
                className="sidebar-tab sidebar-tab-toggle"
                aria-expanded={isProjectsOpen}
                onClick={() => setIsProjectsOpen((v) => !v)}
              >
                <span className="sidebar-tab-label">Projects</span>
                <span
                  className={`sidebar-tab-chevron ${isProjectsOpen ? "open" : ""}`}
                  aria-hidden
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="8 4 16 12 8 20" />
                  </svg>
                </span>
              </button>
              <ul className={`sidebar-submenu ${isProjectsOpen ? "open" : ""}`}>
                {projects.map((p) => (
                  <li key={p.id}>
                    <button
                      className="sidebar-submenu-item"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setLightboxOpen(true);
                      }}
                    >
                      {p.title}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <button
                className="sidebar-tab sidebar-tab-toggle"
                aria-expanded={isStoriesOpen}
                onClick={() => setIsStoriesOpen((v) => !v)}
              >
                <span className="sidebar-tab-label">Stories</span>
                <span
                  className={`sidebar-tab-chevron ${isStoriesOpen ? "open" : ""}`}
                  aria-hidden
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="8 4 16 12 8 20" />
                  </svg>
                </span>
              </button>
              <ul className={`sidebar-submenu ${isStoriesOpen ? "open" : ""}`}>
                {stories.map((s) => (
                  <li key={s.id}>
                    <button
                      className="sidebar-submenu-item"
                      onClick={() => {
                        setSelectedProjectId(s.id);
                        setLightboxOpen(true);
                      }}
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
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
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Iconic Image Section */}
        <section className="iconic-image-container">
          <div 
            className="iconic-image-wrapper"
            onClick={() => setLightboxOpen(true)}
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

        {/* Image Lightbox */}
        <ImageLightbox
          images={projectImages}
          currentIndex={0}
          projectInfo={projectInfo}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

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
