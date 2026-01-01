"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import {
  IconSun,
  IconMoon,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { Box, Stack, NavLink, Text, Group, UnstyledButton, Collapse, ThemeIcon, Divider } from "@mantine/core";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
};

type MobileSidebarProps = {
  onClose: () => void;
  onOpenLightboxWithSeries: (seriesId: string) => void;
};

export default function MobileSidebar({
  onClose,
  onOpenLightboxWithSeries,
}: MobileSidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [stories, setStories] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Collapsible states
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);

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
    <Box h="100%" style={{ display: "flex", flexDirection: "column" }}>
      <Stack gap="xs" style={{ flex: 1 }}>
        <NavLink
          component={Link}
          href="/"
          label="Home"
          active={isActive("/")}
          onClick={onClose}
          fw={500}
        />

        <NavLink
          label="Projects"
          rightSection={projectsOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          opened={projectsOpen}
          onChange={setProjectsOpen}
          active={projectsOpen || pathname?.startsWith("/view/project/")}
          fw={500}
        >
          {loading ? (
            <Text size="sm" c="dimmed" p="md">Loading...</Text>
          ) : projects.length === 0 ? (
             <Text size="sm" c="dimmed" p="md">No projects</Text>
          ) : (
            projects.map((p) => (
              <NavLink
                key={p.id}
                component={Link}
                href={`/view/project/${p.slug || p.id}`}
                label={p.title || 'Untitled Project'}
                active={isActive(`/view/project/${p.slug || p.id}`)}
                onClick={onClose}
                pl="xl"
              />
            ))
          )}
        </NavLink>

        <NavLink
          label="Stories"
          rightSection={storiesOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          opened={storiesOpen}
          onChange={setStoriesOpen}
          active={storiesOpen || pathname?.startsWith("/view/story/")}
          fw={500}
        >
          {loading ? (
            <Text size="sm" c="dimmed" p="md">Loading...</Text>
          ) : stories.length === 0 ? (
             <Text size="sm" c="dimmed" p="md">No stories</Text>
          ) : (
            stories.map((s) => (
              <NavLink
                key={s.id}
                component={Link}
                href={`/view/story/${s.slug || s.id}`}
                label={s.title || 'Untitled Story'}
                active={isActive(`/view/story/${s.slug || s.id}`)}
                onClick={onClose}
                pl="xl"
              />
            ))
          )}
        </NavLink>

        <NavLink
          component={Link}
          href="/about"
          label="About"
          active={isActive("/about")}
          onClick={onClose}
          fw={500}
        />

        <NavLink
          component="a"
          href="mailto:mail@nitinjamdar.in"
          label="Contact"
          onClick={onClose}
          fw={500}
        />
      </Stack>

      <Divider my="md" />

      <Group justify="flex-start" px="md" pb="md">
        <UnstyledButton 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            style={{ 
                color: 'var(--mantine-color-text)',
                padding: '8px',
                borderRadius: '8px',
            }}
        >
            <Group gap="xs">
                {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
                <Text size="sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</Text>
            </Group>
        </UnstyledButton>
      </Group>
    </Box>
  );
}
