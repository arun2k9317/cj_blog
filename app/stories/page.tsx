"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { IconChevronRight, IconChevronLeft, IconBrandInstagram } from "@tabler/icons-react";

// Hardcoded stories pointing to Vercel Blob storage
const BLOB_BASE =
  "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

const stories = [
  {
    id: "dusk-falls-on-mountains",
    title: "Dusk Falls On Mountains",
    location: "",
    thumbnail: `${BLOB_BASE}/duskFallsOnMountains/duskFallsOnMountains_1.jpg`,
    description: "Photo series: Dusk Falls On Mountains.",
  },
  {
    id: "kalaripayattu",
    title: "kalaripayattu",
    location: "",
    thumbnail: `${BLOB_BASE}/kalaripayattu/kalaripayattu_1.JPG`,
    description: "Photo series: kalaripayattu.",
  },
];

export default function StoriesPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (
    <div
      className={`main-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* Left Sidebar */}
      <aside className="sidebar">
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarCollapsed((v: boolean) => !v)}
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
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/projects">Projects</Link>
            </li>
            <li>
              <Link href="/stories" className="active">Stories</Link>
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
            <IconBrandInstagram size={20} />
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="projects-container">
          <div className="projects-header">
            <h1>Stories</h1>
          </div>

          <div className="projects-grid">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/projects/${story.id}`}
                className="project-card"
              >
                <div className="project-image-container">
                  <Image
                    src={story.thumbnail}
                    alt={story.title}
                    className="project-thumbnail"
                    width={600}
                    height={400}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="project-info">
                  <h3 className="project-title">{story.title}</h3>
                  <p className="project-location">{story.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

