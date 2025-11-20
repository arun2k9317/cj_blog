"use client";

import Link from "next/link";
import Image from "next/image";
import { Container, Title, SimpleGrid, Card, Box, Text, Stack } from "@mantine/core";

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
  return (
    <Container className="projects-container" size="xl" py="xl" px={{ base: "md", md: "xl" }}>
      <Stack gap="xl">
        <div className="projects-header">
          <Title order={1}>Stories</Title>
        </div>

        <SimpleGrid
          className="projects-grid"
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: "md", md: "xl" }}
        >
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/projects/${story.id}`}
              className="project-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card className="project-card" padding={0} radius="md" withBorder>
                <Box className="project-image-container">
                  <Image
                    src={story.thumbnail}
                    alt={story.title}
                    className="project-thumbnail"
                    width={600}
                    height={400}
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Stack gap="xs" p="lg" className="project-info">
                  <Title order={3} className="project-title">{story.title}</Title>
                  {story.location && (
                    <Text size="sm" className="project-location">{story.location}</Text>
                  )}
                </Stack>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
