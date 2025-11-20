"use client";

import { Container, Title, Text, Stack } from "@mantine/core";

export default function AboutPage() {
  return (
    <Container className="projects-container" size="xl" py="xl" px={{ base: "md", md: "xl" }}>
      <Stack gap="xl">
        <div className="projects-header">
          <Title order={1}>About</Title>
        </div>

        <div className="content-text">
          <Text size="md" style={{ marginBottom: "20px" }}>
            Welcome to NJ Photography, where visual storytelling meets artistic
            excellence. We are dedicated to capturing the essence of moments,
            places, and cultures through the lens of photography.
          </Text>
          <Text size="md">
            Our work spans across nature, culture, arts, and extraordinary
            destinations, always with a focus on authenticity and artistic vision.
          </Text>
        </div>
      </Stack>
    </Container>
  );
}
