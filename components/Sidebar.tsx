"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { projectsSeries, storiesSeries } from "@/lib/series";
import { useState } from "react";
import {
  IconChevronRight,
  IconChevronLeft,
  IconBrandInstagram,
  IconMail,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
  onOpenLightboxWithSeries: (seriesId: string) => void;
};

export default function Sidebar({ isCollapsed, onToggle, onOpenLightboxWithSeries }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <IconChevronRight size={12} aria-hidden />
        ) : (
          <IconChevronLeft size={12} aria-hidden />
        )}
      </button>

      <div className="sidebar-logo">
        <div className="sidebar-logo-row">
          <span>NJ</span>
          <Image src="/logo.png" alt="NJ Photography Logo" width={40} height={40} />
        </div>
        <span>PHOTOGRAPHY</span>
      </div>

      <nav>
        <ul className="sidebar-nav">
          <li>
            <Link href="/" className={isActive("/") ? "active" : undefined}>
              Home
            </Link>
          </li>
          <li>
            <button
              className="sidebar-tab sidebar-tab-toggle"
              aria-expanded={isProjectsOpen}
              onClick={() => setIsProjectsOpen((v) => !v)}
            >
              <span className="sidebar-tab-label">Projects</span>
              <span className={`sidebar-tab-chevron ${isProjectsOpen ? "open" : ""}`} aria-hidden>
                <IconChevronRight size={12} />
              </span>
            </button>
            <ul className={`sidebar-submenu ${isProjectsOpen ? "open" : ""}`}>
              {projectsSeries.map((p) => (
                <li key={p.id}>
                  <button
                    className="sidebar-submenu-item"
                    onClick={() => onOpenLightboxWithSeries(p.id)}
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
              <span className={`sidebar-tab-chevron ${isStoriesOpen ? "open" : ""}`} aria-hidden>
                <IconChevronRight size={12} />
              </span>
            </button>
            <ul className={`sidebar-submenu ${isStoriesOpen ? "open" : ""}`}>
              {storiesSeries.map((s) => (
                <li key={s.id}>
                  <button
                    className="sidebar-submenu-item"
                    onClick={() => onOpenLightboxWithSeries(s.id)}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Link href="/about" className={isActive("/about") ? "active" : undefined}>
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className={isActive("/contact") ? "active" : undefined}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-social">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <IconBrandInstagram size={20} />
        </a>
        <a href="mailto:contact@njphotography.com" aria-label="Email">
          <IconMail size={20} />
        </a>
      </div>

      {/* Theme Switcher */}
      <div className="sidebar-theme-switcher">
        <div className="theme-switcher-inline" aria-label="Theme switcher">
          <IconSun size={16} aria-hidden />
          <label
            className="lightbox-switch"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <input
              type="checkbox"
              role="switch"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
            <span className="lightbox-switch-slider" />
          </label>
          <IconMoon size={16} aria-hidden />
        </div>
      </div>
    </aside>
  );
}


