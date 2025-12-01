"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import {
  IconChevronRight,
  IconChevronLeft,
  IconMail,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
};

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
  onOpenLightboxWithSeries: (seriesId: string) => void;
};

export default function Sidebar({
  isCollapsed,
  onToggle,
  onOpenLightboxWithSeries,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [stories, setStories] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch published projects and stories from database
    fetch('/api/projects-list')
      .then(res => res.json())
      .then(data => {
        setProjects(data.projects || []);
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching projects/stories:', error);
        setLoading(false);
      });
  }, []);

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
        <span>Nitin Jamdar</span>
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
            </button>
            <ul className={`sidebar-submenu ${isProjectsOpen ? "open" : ""}`}>
              {loading ? (
                <li>
                  <span className="sidebar-submenu-item" style={{ opacity: 0.6 }}>
                    Loading...
                  </span>
                </li>
              ) : projects.length === 0 ? (
                <li>
                  <span className="sidebar-submenu-item" style={{ opacity: 0.6 }}>
                    No projects
                  </span>
                </li>
              ) : (
                projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/view/project/${p.slug || p.id}`}
                      className={`sidebar-submenu-item ${isActive(`/view/project/${p.slug || p.id}`) ? "active" : ""}`}
                      onClick={() => setIsProjectsOpen(false)}
                    >
                      {p.title || 'Untitled Project'}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </li>
          <li>
            <button
              className="sidebar-tab sidebar-tab-toggle"
              aria-expanded={isStoriesOpen}
              onClick={() => setIsStoriesOpen((v) => !v)}
            >
              <span className="sidebar-tab-label">Stories</span>
            </button>
            <ul className={`sidebar-submenu ${isStoriesOpen ? "open" : ""}`}>
              {loading ? (
                <li>
                  <span className="sidebar-submenu-item" style={{ opacity: 0.6 }}>
                    Loading...
                  </span>
                </li>
              ) : stories.length === 0 ? (
                <li>
                  <span className="sidebar-submenu-item" style={{ opacity: 0.6 }}>
                    No stories
                  </span>
                </li>
              ) : (
                stories.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/view/story/${s.slug || s.id}`}
                      className={`sidebar-submenu-item ${isActive(`/view/story/${s.slug || s.id}`) ? "active" : ""}`}
                      onClick={() => setIsStoriesOpen(false)}
                    >
                      {s.title || 'Untitled Story'}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </li>
          <li>
            <Link
              href="/about"
              className={isActive("/about") ? "active" : undefined}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-social">
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
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } theme`}
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
