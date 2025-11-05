"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import ImageLightbox from "@/components/ImageLightbox";
import {
  IconChevronRight,
  IconChevronLeft,
  IconCamera,
  IconCameraOff,
  IconBrandInstagram,
} from "@tabler/icons-react";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
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
            <IconChevronRight size={12} aria-hidden />
          ) : (
            <IconChevronLeft size={12} aria-hidden />
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
                  <IconChevronRight size={12} />
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
                  <IconChevronRight size={12} />
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

        {/* Theme Switcher */}
        <div className="sidebar-theme-switcher">
          <button
            className="theme-switcher-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? (
              <IconCamera size={24} />
            ) : (
              <IconCameraOff size={24} />
            )}
          </button>
        </div>

        <div className="sidebar-social">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconBrandInstagram size={20} />
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
