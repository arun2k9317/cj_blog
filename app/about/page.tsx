"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { IconChevronRight, IconChevronLeft, IconBrandInstagram } from "@tabler/icons-react";

export default function AboutPage() {
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
              <Link href="/stories">Stories</Link>
            </li>
            <li>
              <Link href="/about" className="active">About</Link>
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
            <h1>About</h1>
          </div>

          <div className="content-text">
            <p>
              Welcome to NJ Photography, where visual storytelling meets artistic
              excellence. We are dedicated to capturing the essence of moments, places,
              and cultures through the lens of photography.
            </p>
            <p>
              Our work spans across nature, culture, arts, and extraordinary
              destinations, always with a focus on authenticity and artistic vision.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
