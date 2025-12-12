"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import GallerySection from "@/components/GallerySection";
import ProjectCard from "@/components/ProjectCard";
import IconicImageSelector from "@/components/IconicImageSelector";
import { useTheme } from "@/contexts/ThemeContext";
import { IconSun, IconMoon, IconLogout, IconMail, IconBrandWhatsapp } from "@tabler/icons-react";
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Group,
  Stack,
  SimpleGrid,
  Card,
  ActionIcon,
  Tooltip,
  Select,
} from "@mantine/core";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  featured_image?: string | null;
  published?: boolean | null;
  [key: string]: unknown;
};

interface AdminDashboardUIProps {
  projects: ProjectRow[];
  stories: ProjectRow[];
  galleryAssets: Array<{ url: string }>;
}

type FilterOption = "all" | "published" | "unpublished";

export default function AdminDashboardUI({
  projects,
  stories,
  galleryAssets,
}: AdminDashboardUIProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [projectFilter, setProjectFilter] = useState<FilterOption>("all");

  const [storyFilter, setStoryFilter] = useState<FilterOption>("all");
  const [iconicModalOpen, setIconicModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredProjects = useMemo(() => {
    if (projectFilter === "all") return projects;
    if (projectFilter === "published") {
      return projects.filter((p) => p.published === true);
    }
    return projects.filter((p) => !p.published);
  }, [projects, projectFilter]);

  const filteredStories = useMemo(() => {
    if (storyFilter === "all") return stories;
    if (storyFilter === "published") {
      return stories.filter((s) => s.published === true);
    }
    return stories.filter((s) => !s.published);
  }, [stories, storyFilter]);

  return (
    <Container
      size="xl"
      py="sm"
      px="sm"
      className="admin-dashboard"
      style={{
        backgroundColor: isDark
          ? "var(--mantine-color-dark-7)"
          : "var(--mantine-color-gray-0)",
        minHeight: "100vh",
        borderRadius: "var(--mantine-radius-lg)",
      }}
    >
      <Group justify="space-between" mb="xs">
        <Title
          order={2}
          size="1.5rem"
          c={
            isDark
              ? "var(--mantine-color-gray-0)"
              : "var(--mantine-color-dark-9)"
          }
        >
          Admin Dashboard
        </Title>
        <Group gap="xs">
          <Tooltip
            label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <ActionIcon
              variant="subtle"
              color={isDark ? "blue" : "dark"}
              onClick={toggleTheme}
              size="lg"
              aria-label="Toggle theme"
              styles={{
                root: {
                  color: isDark ? "var(--mantine-color-gray-0)" : undefined,
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--mantine-color-blue-9)"
                      : undefined,
                  },
                },
              }}
            >
              {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Logout">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={handleLogout}
              size="lg"
              aria-label="Logout"
              styles={{
                root: {
                  color: isDark
                    ? "var(--mantine-color-red-4)"
                    : "var(--mantine-color-red-6)",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "var(--mantine-color-red-9)"
                      : "var(--mantine-color-red-1)",
                  },
                },
              }}
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
          <Link href="/admin/new?kind=project">
            <Button variant="filled" color={isDark ? "gray" : "dark"} size="xs">
              New Project
            </Button>
          </Link>
          <Link href="/admin/new?kind=story">
            <Button
              variant="outline"
              size="xs"
              color={isDark ? "blue" : "dark"}
              styles={{
                root: {
                  borderColor: isDark
                    ? "var(--mantine-color-blue-6)"
                    : undefined,
                  color: isDark ? "var(--mantine-color-gray-0)" : undefined,
                },
              }}
            >
              New Story
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="xs" 
            color={isDark ? "grape" : "grape"}
            onClick={() => setIconicModalOpen(true)}
          >
             Iconic Images
          </Button>
        </Group>
      </Group>

      <Stack gap="md">
        {/* Gallery Uploads Section */}
        <GallerySection galleryAssets={galleryAssets} />

        {/* Projects Section */}
        <Paper
          shadow="xs"
          p="md"
          radius="md"
          withBorder
          style={{
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
            borderColor: isDark
              ? "var(--mantine-color-dark-4)"
              : "var(--mantine-color-gray-3)",
          }}
        >
          <Group justify="space-between" mb="sm" wrap="wrap">
            <Title
              order={3}
              size="1.1rem"
              c={
                isDark
                  ? "var(--mantine-color-gray-0)"
                  : "var(--mantine-color-dark-9)"
              }
            >
              Projects
            </Title>
            <Group gap="xs" align="center">
              <Select
                placeholder="Filter"
                data={[
                  { value: "all", label: "All" },
                  { value: "published", label: "Published" },
                  { value: "unpublished", label: "Unpublished" },
                ]}
                value={projectFilter}
                onChange={(value) =>
                  setProjectFilter((value as FilterOption) || "all")
                }
                size="xs"
                style={{ minWidth: 120 }}
                clearable={false}
                styles={{
                  input: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-white)",
                  },
                  dropdown: {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                  },
                  option: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              />
              <Text
                size="xs"
                c={isDark ? "var(--mantine-color-gray-3)" : "dimmed"}
                style={{
                  color: isDark ? "var(--mantine-color-gray-3)" : undefined,
                }}
              >
                {filteredProjects.length} / {projects.length}
              </Text>
            </Group>
          </Group>

          {filteredProjects.length === 0 ? (
            <Card
              withBorder
              p="xl"
              radius="md"
              style={{
                backgroundColor: isDark
                  ? "var(--mantine-color-dark-5)"
                  : "var(--mantine-color-gray-0)",
                borderColor: isDark
                  ? "var(--mantine-color-dark-4)"
                  : "var(--mantine-color-gray-3)",
              }}
            >
              <Text size="sm" c="dimmed" ta="center">
                {projectFilter === "all"
                  ? "No projects yet."
                  : projectFilter === "published"
                  ? "No published projects."
                  : "No unpublished projects."}
              </Text>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  slug={p.slug}
                  featuredImage={
                    typeof p.featured_image === "string"
                      ? p.featured_image
                      : null
                  }
                  published={p.published ?? null}
                  kind="project"
                />
              ))}
            </SimpleGrid>
          )}
        </Paper>

        {/* Stories Section */}
        <Paper
          shadow="xs"
          p="md"
          radius="md"
          withBorder
          style={{
            backgroundColor: isDark
              ? "var(--mantine-color-dark-6)"
              : "var(--mantine-color-white)",
            borderColor: isDark
              ? "var(--mantine-color-dark-4)"
              : "var(--mantine-color-gray-3)",
          }}
        >
          <Group justify="space-between" mb="sm" wrap="wrap">
            <Title
              order={3}
              size="1.1rem"
              c={
                isDark
                  ? "var(--mantine-color-gray-0)"
                  : "var(--mantine-color-dark-9)"
              }
            >
              Stories
            </Title>
            <Group gap="xs" align="center">
              <Select
                placeholder="Filter"
                data={[
                  { value: "all", label: "All" },
                  { value: "published", label: "Published" },
                  { value: "unpublished", label: "Unpublished" },
                ]}
                value={storyFilter}
                onChange={(value) =>
                  setStoryFilter((value as FilterOption) || "all")
                }
                size="xs"
                style={{ minWidth: 120 }}
                clearable={false}
                styles={{
                  input: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-5)"
                      : "var(--mantine-color-white)",
                  },
                  dropdown: {
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                  },
                  option: {
                    color: isDark
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-dark-9)",
                    backgroundColor: isDark
                      ? "var(--mantine-color-dark-6)"
                      : "var(--mantine-color-white)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "var(--mantine-color-dark-5)"
                        : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              />
              <Text
                size="xs"
                c={isDark ? "var(--mantine-color-gray-3)" : "dimmed"}
                style={{
                  color: isDark ? "var(--mantine-color-gray-3)" : undefined,
                }}
              >
                {filteredStories.length} / {stories.length}
              </Text>
            </Group>
          </Group>

          {filteredStories.length === 0 ? (
            <Card
              withBorder
              p="xl"
              radius="md"
              style={{
                backgroundColor: isDark
                  ? "var(--mantine-color-dark-5)"
                  : "var(--mantine-color-gray-0)",
                borderColor: isDark
                  ? "var(--mantine-color-dark-4)"
                  : "var(--mantine-color-gray-3)",
              }}
            >
              <Text size="sm" c="dimmed" ta="center">
                {storyFilter === "all"
                  ? "No stories yet."
                  : storyFilter === "published"
                  ? "No published stories."
                  : "No unpublished stories."}
              </Text>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              {filteredStories.map((s) => (
                <ProjectCard
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  slug={s.slug}
                  featuredImage={
                    typeof s.featured_image === "string"
                      ? s.featured_image
                      : null
                  }
                  published={s.published ?? null}
                  kind="story"
                />
              ))}
            </SimpleGrid>
          )}
        </Paper>
      </Stack>

      
      <IconicImageSelector 
        opened={iconicModalOpen} 
        onClose={() => setIconicModalOpen(false)} 
        galleryAssets={galleryAssets} 
      />

      <Group justify="center" mt="xl" pb="md" gap="xs">
        <Text size="xs" c="dimmed">
          Contact support
        </Text>
        <Tooltip label="Email Developer">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            component="a"
            href="mailto:arun.subramanian.4505@gmail.com?subject=Admin%20Dashboard%20Support"
            aria-label="Email Developer"
          >
            <IconMail size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="WhatsApp Developer">
          <ActionIcon
            variant="subtle"
            color="green"
            size="sm"
            component="a"
            href="https://wa.me/919495319972"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Developer"
          >
            <IconBrandWhatsapp size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Container>
  );
}
