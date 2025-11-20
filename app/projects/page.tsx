"use client";

import Link from "next/link";
import Image from "next/image";
import { Container, Title, SimpleGrid, Card, Box, Text, Stack } from "@mantine/core";

// Hardcoded projects pointing to Vercel Blob storage
const BLOB_BASE =
  "https://v96anmwogiriaihi.public.blob.vercel-storage.com/admin-uploads";

const projects = [
  {
    id: "behind-the-tea-cup",
    title: "Behind The Tea Cup",
    location: "",
    architect: "",
    thumbnail: `${BLOB_BASE}/behindTheTeaCup/behindTheTeaCup_1.jpg`,
    description: "Photo series: Behind The Tea Cup.",
  },
  {
    id: "coffee-and-the-hills",
    title: "Coffee And The Hills",
    location: "",
    architect: "",
    thumbnail: `${BLOB_BASE}/coffeeAndTheHills/coffeeAndTheHills_1.jpg`,
    description: "Photo series: Coffee And The Hills.",
  },
];

export default function ProjectsPage() {
  return (
    <Container className="projects-container" size="xl" py="xl" px={{ base: "md", md: "xl" }}>
      <Stack gap="xl">
        <div className="projects-header">
          <Title order={1}>Projects</Title>
        </div>

        <SimpleGrid
          className="projects-grid"
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: "md", md: "xl" }}
        >
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="project-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card className="project-card" padding={0} radius="md" withBorder>
                <Box className="project-image-container">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    className="project-thumbnail"
                    width={600}
                    height={400}
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Stack gap="xs" p="lg" className="project-info">
                  <Title order={3} className="project-title">{project.title}</Title>
                  {project.location && (
                    <Text size="sm" className="project-location">{project.location}</Text>
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
