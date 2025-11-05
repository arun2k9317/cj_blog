"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { IconChevronRight, IconChevronLeft, IconBrandInstagram } from "@tabler/icons-react";

export default function ContactPage() {
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
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact" className="active">Contact</Link>
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
            <h1>Contact</h1>
          </div>

          <div className="content-text">
            <p>
              Get in touch with NJ Photography for inquiries, collaborations, or
              to discuss your photography needs.
            </p>
            <p>
              We&apos;d love to hear from you and explore how we can work together
              to bring your vision to life.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
