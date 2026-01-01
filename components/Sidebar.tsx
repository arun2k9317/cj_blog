"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { NavLink, Box } from "@mantine/core";
import {
  IconChevronRight,
  IconChevronLeft,
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
  isMobile?: boolean;
};

export default function Sidebar({
  isCollapsed,
  onToggle,
  onOpenLightboxWithSeries,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [stories, setStories] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch published projects and stories from database
    fetch("/api/projects-list")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects/stories:", error);
        setLoading(false);
      });
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className="sidebar"
      style={isMobile ? { width: "100%", border: "none" } : undefined}
    >
      {!isMobile && (
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
      )}

      {/* <div className="sidebar-logo">
        <span>Nitin Jamdar</span>
      </div> */}

      <nav>
        <Box className="sidebar-nav-mantine">
          <NavLink
            component={Link}
            href="/"
            label="Home"
            active={isActive("/")}
            childrenOffset={28}
          />

          <NavLink label="Projects" childrenOffset={28}>
            {loading ? (
              <NavLink label="Loading..." disabled />
            ) : projects.length === 0 ? (
              <NavLink label="No projects" disabled />
            ) : (
              projects.map((p) => (
                <NavLink
                  key={p.id}
                  component={Link}
                  href={`/view/project/${p.slug || p.id}`}
                  label={p.title || "Untitled Project"}
                  active={isActive(`/view/project/${p.slug || p.id}`)}
                />
              ))
            )}
          </NavLink>

          <NavLink label="Stories" childrenOffset={28}>
            {loading ? (
              <NavLink label="Loading..." disabled />
            ) : stories.length === 0 ? (
              <NavLink label="No stories" disabled />
            ) : (
              stories.map((s) => (
                <NavLink
                  key={s.id}
                  component={Link}
                  href={`/view/story/${s.slug || s.id}`}
                  label={s.title || "Untitled Story"}
                  active={isActive(`/view/story/${s.slug || s.id}`)}
                />
              ))
            )}
          </NavLink>

          <NavLink
            component={Link}
            href="/about"
            label="About"
            active={isActive("/about")}
            childrenOffset={28}
          />

          <NavLink
            href="mailto:mail@nitinjamdar.in"
            label="Contact"
            childrenOffset={28}
          />
        </Box>
      </nav>

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
