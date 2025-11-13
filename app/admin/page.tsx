import { getProjects, getAssets } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import GallerySection from "@/components/GallerySection";
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
  Badge,
} from "@mantine/core";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Server-side fetch for speed and to keep keys server-only
  // Projects (kind=project) and Stories (kind=story) are optional if 'kind' column exists.
  // If 'kind' doesn't exist in your DB, remove the kind filter below.
  let projects: any[] = [];
  let stories: any[] = [];
  let assets: any[] = [];

  try {
    projects = await getProjects({ publishedOnly: false, kind: "project" });
  } catch {
    // Fallback: fetch all and treat as projects
    projects = await getProjects({ publishedOnly: false }).catch(() => []);
  }

  try {
    stories = await getProjects({ publishedOnly: false, kind: "story" });
  } catch {
    // If 'kind' not present yet, leave stories empty
    stories = [];
  }

  try {
    assets = await getAssets();
  } catch {
    assets = [];
  }

  const galleryAssets =
    (assets || []).filter((a: any) => {
      const path = a?.path || "";
      const url = a?.url || "";
      const filename = a?.filename || "";
      // Check if path, URL, or filename contains "gallery"
      const pathStr = typeof path === "string" ? path : "";
      const urlStr = typeof url === "string" ? url : "";
      const filenameStr = typeof filename === "string" ? filename : "";
      return (
        pathStr.includes("gallery") ||
        urlStr.includes("/gallery/") ||
        urlStr.includes("/gallery") ||
        filenameStr.includes("gallery")
      );
    }) || [];

  return (
    <Container size="xl" py="lg" px="sm" className="admin-dashboard">
      <Group justify="space-between" mb="lg">
        <Title order={2} size="1.5rem">
          Admin Dashboard
        </Title>
        <Group gap="xs">
          <Link href="/admin/new?kind=project">
            <Button variant="filled" color="dark" size="xs">
              New Project
            </Button>
          </Link>
          <Link href="/admin/new?kind=story">
            <Button variant="outline" size="xs">
              New Story
            </Button>
          </Link>
        </Group>
      </Group>

      <Stack gap="lg">
        {/* Gallery Uploads Section */}
        <GallerySection galleryAssets={galleryAssets} />

        {/* Projects Section */}
        <Paper shadow="xs" p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3} size="1.1rem">
              Projects
            </Title>
            <Text size="xs" c="dimmed">
              {projects.length} total
            </Text>
          </Group>

          {projects.length === 0 ? (
            <Card withBorder p="xl" radius="md">
              <Text size="sm" c="dimmed" ta="center">
                No projects yet.
              </Text>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              {projects.map((p) => (
                <Card
                  key={p.id}
                  shadow="xs"
                  padding="md"
                  radius="md"
                  withBorder
                >
                  <Group justify="space-between" mb="xs" gap="xs">
                    <Text fw={500} size="sm">
                      {p.title}
                    </Text>
                    <Badge
                      color={p.published ? "green" : "yellow"}
                      variant="light"
                      size="xs"
                    >
                      {p.published ? "Published" : "Draft"}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mb="sm">
                    {p.slug}
                  </Text>
                  {p.featured_image ? (
                    <div
                      style={{
                        position: "relative",
                        marginBottom: "var(--mantine-spacing-sm)",
                        height: "140px",
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "var(--mantine-radius-md)",
                        backgroundColor: "var(--mantine-color-gray-1)",
                      }}
                    >
                      <Image
                        src={p.featured_image}
                        alt={p.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <Group gap="xs" mt="sm">
                    <Link href={`/admin/edit/${encodeURIComponent(p.id)}`}>
                      <Button variant="filled" color="dark" size="xs">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/api/projects/${encodeURIComponent(p.id)}`}>
                      <Button variant="outline" size="xs">
                        View JSON
                      </Button>
                    </Link>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Paper>

        {/* Stories Section */}
        <Paper shadow="xs" p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3} size="1.1rem">
              Stories
            </Title>
            <Text size="xs" c="dimmed">
              {stories.length} total
            </Text>
          </Group>

          {stories.length === 0 ? (
            <Card withBorder p="xl" radius="md">
              <Text size="sm" c="dimmed" ta="center">
                No stories yet.
              </Text>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
              {stories.map((s) => (
                <Card
                  key={s.id}
                  shadow="xs"
                  padding="md"
                  radius="md"
                  withBorder
                >
                  <Group justify="space-between" mb="xs" gap="xs">
                    <Text fw={500} size="sm">
                      {s.title}
                    </Text>
                    <Badge
                      color={s.published ? "green" : "yellow"}
                      variant="light"
                      size="xs"
                    >
                      {s.published ? "Published" : "Draft"}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mb="sm">
                    {s.slug}
                  </Text>
                  {s.featured_image ? (
                    <div
                      style={{
                        position: "relative",
                        marginBottom: "var(--mantine-spacing-sm)",
                        height: "140px",
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "var(--mantine-radius-md)",
                        backgroundColor: "var(--mantine-color-gray-1)",
                      }}
                    >
                      <Image
                        src={s.featured_image}
                        alt={s.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : null}
                  <Group gap="xs" mt="sm">
                    <Link href={`/admin/edit/${encodeURIComponent(s.id)}`}>
                      <Button variant="filled" color="dark" size="xs">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/api/projects/${encodeURIComponent(s.id)}`}>
                      <Button variant="outline" size="xs">
                        View JSON
                      </Button>
                    </Link>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Paper>

        {/* Assets Section */}
        <Paper shadow="xs" p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3} size="1.1rem">
              Assets (Blob)
            </Title>
            <Text size="xs" c="dimmed">
              {assets.length} total
            </Text>
          </Group>

          {assets.length === 0 ? (
            <Card withBorder p="xl" radius="md">
              <Text size="sm" c="dimmed" ta="center">
                No assets found or assets table not configured.
              </Text>
            </Card>
          ) : (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {assets.map((a) => (
                <Card
                  key={a.id}
                  padding="xs"
                  radius="md"
                  withBorder
                  shadow="xs"
                >
                  <div
                    style={{
                      position: "relative",
                      marginBottom: "var(--mantine-spacing-xs)",
                      height: "110px",
                      width: "100%",
                      overflow: "hidden",
                      borderRadius: "var(--mantine-radius-md)",
                      backgroundColor: "var(--mantine-color-gray-1)",
                    }}
                  >
                    <Image
                      src={a.url}
                      alt={a.path || "asset"}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <Text size="xs" truncate>
                    {a.path || a.url}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    {a.mime_type || "image"}{" "}
                    {a.width && a.height ? `· ${a.width}×${a.height}` : ""}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
